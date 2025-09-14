const express = require('express');
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blog
// @desc    Obtenir tous les articles publiés
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      search, 
      limit = 10, 
      page = 1,
      sort = 'recent' 
    } = req.query;

    let filter = { status: 'published' };
    let sortOption = {};

    // Filtres
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    // Tri
    switch (sort) {
      case 'popular':
        sortOption = { views: -1, publishedAt: -1 };
        break;
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    let query = BlogPost.find(filter)
      .populate('author', 'firstName lastName')
      .select('-content') // Exclure le contenu complet pour la liste
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Recherche
    if (search) {
      const posts = await BlogPost.search(search)
        .populate('author', 'firstName lastName')
        .select('-content')
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await BlogPost.search(search).countDocuments();
      
      return res.json({
        posts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    const posts = await query;
    const total = await BlogPost.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur récupération articles:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des articles' });
  }
});

// @route   GET /api/blog/categories
// @desc    Obtenir toutes les catégories avec le nombre d'articles
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });

  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des catégories' });
  }
});

// @route   GET /api/blog/tags
// @desc    Obtenir tous les tags populaires
// @access  Public
router.get('/tags', async (req, res) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags });

  } catch (error) {
    console.error('Erreur récupération tags:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des tags' });
  }
});

// @route   GET /api/blog/:slug
// @desc    Obtenir un article par slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
    .populate('author', 'firstName lastName avatar')
    .populate('comments.author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Incrémenter les vues
    await post.incrementViews();

    // Articles similaires
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
    .select('title slug excerpt featuredImage publishedAt readingTime')
    .limit(3)
    .sort({ publishedAt: -1 });

    res.json({ 
      post: {
        ...post.toObject(),
        views: post.views + 1 // Inclure la vue actuelle
      },
      relatedPosts 
    });

  } catch (error) {
    console.error('Erreur récupération article:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'article' });
  }
});

// @route   POST /api/blog
// @desc    Créer un nouvel article (Admin)
// @access  Private (Admin)
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('excerpt').trim().isLength({ max: 300 }).withMessage('L\'extrait ne peut excéder 300 caractères'),
  body('content').trim().notEmpty().withMessage('Le contenu est requis'),
  body('category').isIn(['voyance', 'reiki', 'spiritualite', 'bien-etre', 'guidance', 'temoignages']).withMessage('Catégorie invalide'),
  body('tags').optional().isArray().withMessage('Les tags doivent être un tableau'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const postData = {
      ...req.body,
      author: req.user.userId
    };

    const post = new BlogPost(postData);
    await post.save();

    await post.populate('author', 'firstName lastName');

    res.status(201).json({
      message: 'Article créé avec succès',
      post
    });

  } catch (error) {
    console.error('Erreur création article:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'article' });
  }
});

// @route   PUT /api/blog/:id
// @desc    Modifier un article (Admin)
// @access  Private (Admin)
router.put('/:id', adminAuth, [
  body('title').optional().trim().notEmpty().withMessage('Le titre ne peut être vide'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('L\'extrait ne peut excéder 300 caractères'),
  body('content').optional().trim().notEmpty().withMessage('Le contenu ne peut être vide'),
  body('category').optional().isIn(['voyance', 'reiki', 'spiritualite', 'bien-etre', 'guidance', 'temoignages']).withMessage('Catégorie invalide'),
  body('tags').optional().isArray().withMessage('Les tags doivent être un tableau'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json({
      message: 'Article modifié avec succès',
      post
    });

  } catch (error) {
    console.error('Erreur modification article:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification de l\'article' });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Supprimer un article (Admin)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json({ message: 'Article supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'article' });
  }
});

// @route   POST /api/blog/:id/comment
// @desc    Ajouter un commentaire
// @access  Public
router.post('/:id/comment', [
  body('author.name').trim().notEmpty().withMessage('Le nom est requis'),
  body('author.email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Le commentaire doit contenir entre 10 et 1000 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const post = await BlogPost.findById(req.params.id);
    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const comment = {
      author: req.body.author,
      content: req.body.content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      message: 'Commentaire ajouté avec succès (en attente de modération)',
      comment
    });

  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire' });
  }
});

module.exports = router;