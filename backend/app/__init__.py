from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.models import db, User

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # User loader callback for JWT if needed
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return str(user)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(id=int(identity)).one_or_none()

    import os
    from flask import send_from_directory

    # Ensure uploads directory exists
    upload_dir = os.path.abspath(os.path.join(app.root_path, '..', 'uploads', 'products'))
    os.makedirs(upload_dir, exist_ok=True)

    @app.route('/uploads/products/<filename>')
    def serve_uploaded_product_image(filename):
        return send_from_directory(upload_dir, filename)

    # Configure frontend static build directory
    dist_folder = os.path.abspath(os.path.join(app.root_path, '..', '..', 'frontend', 'dist'))
    app.static_folder = dist_folder
    app.static_url_path = ''

    # Global Error Handlers
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'An unexpected internal error occurred'}), 500

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.categories import categories_bp
    from app.routes.brands import brands_bp
    from app.routes.cart import cart_bp
    from app.routes.wishlist import wishlist_bp
    from app.routes.orders import orders_bp
    from app.routes.reviews import reviews_bp
    from app.routes.coupons import coupons_bp
    from app.routes.notifications import notifications_bp
    from app.routes.blogs import blogs_bp
    from app.routes.faqs import faqs_bp
    from app.routes.contact import contact_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(brands_bp, url_prefix='/api/brands')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(blogs_bp, url_prefix='/api/blogs')
    app.register_blueprint(faqs_bp, url_prefix='/api/faqs')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # SPA Catch-All Route for Frontend Integration
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/') or path.startswith('uploads/'):
            return jsonify({'error': 'Resource not found'}), 404
        target_file = os.path.join(dist_folder, path)
        if path != "" and os.path.exists(target_file):
            return send_from_directory(dist_folder, path)
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')
        return jsonify({
            'status': 'online',
            'message': 'ShopSphere Backend API is connected and active.',
            'api_documentation': '/api/products',
            'note': 'To serve frontend directly from Flask, run `npm run build` inside the frontend directory.'
        })

    return app
