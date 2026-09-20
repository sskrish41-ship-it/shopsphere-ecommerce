from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), default='user') # 'user', 'admin'
    is_active = db.Column(db.Boolean, default=True)
    avatar = db.Column(db.String(255), default='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200')
    auth_provider = db.Column(db.String(20), default='local') # 'local', 'google'
    google_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    addresses = db.relationship('Address', backref='user', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'avatar': self.avatar,
            'auth_provider': self.auth_provider,
            'google_id': self.google_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    street = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), default='United States')
    is_default = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'is_default': self.is_default
        }

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    image_url = db.Column(db.String(255))
    icon = db.Column(db.String(50))
    display_order = db.Column(db.Integer, default=0)

    products = db.relationship('Product', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'image_url': self.image_url,
            'icon': self.icon,
            'display_order': self.display_order,
            'product_count': len(self.products)
        }

class Brand(db.Model):
    __tablename__ = 'brands'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    logo_url = db.Column(db.String(255))
    description = db.Column(db.Text)

    products = db.relationship('Product', backref='brand', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'logo_url': self.logo_url,
            'description': self.description,
            'product_count': len(self.products)
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('brands.id'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    short_description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=False)
    discount_percent = db.Column(db.Integer, default=0)
    stock_quantity = db.Column(db.Integer, default=0)
    sku = db.Column(db.String(50), unique=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_trending = db.Column(db.Boolean, default=False)
    is_deal = db.Column(db.Boolean, default=False)
    deal_end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='active') # 'active', 'draft', 'out_of_stock', 'archived'
    warranty = db.Column(db.String(100), default='1 Year Standard Warranty')
    return_policy = db.Column(db.String(100), default='30-Day Money Back Guarantee')
    video_url = db.Column(db.String(255), nullable=True)
    rating = db.Column(db.Float, default=4.5)
    review_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    images = db.relationship('ProductImage', backref='product', lazy=True, cascade="all, delete-orphan")
    variants = db.relationship('ProductVariant', backref='product', lazy=True, cascade="all, delete-orphan")
    specs = db.relationship('ProductSpec', backref='product', lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship('Review', backref='product', lazy=True, cascade="all, delete-orphan")
    questions = db.relationship('ProductQuestion', backref='product', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_details=False):
        primary_image = next((img.image_url for img in self.images if img.is_primary), None)
        if not primary_image and self.images:
            primary_image = self.images[0].image_url

        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'brand': self.brand.to_dict() if self.brand else None,
            'category': self.category.to_dict() if self.category else None,
            'category_id': self.category_id,
            'brand_id': self.brand_id,
            'short_description': self.short_description,
            'price': self.price,
            'original_price': self.original_price,
            'discount_percent': self.discount_percent,
            'stock_quantity': self.stock_quantity,
            'sku': self.sku,
            'is_featured': self.is_featured,
            'is_trending': self.is_trending,
            'is_deal': self.is_deal,
            'deal_end_time': self.deal_end_time.isoformat() if self.deal_end_time else None,
            'status': self.status,
            'rating': self.rating,
            'review_count': self.review_count,
            'primary_image': primary_image or 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_details:
            data.update({
                'description': self.description,
                'warranty': self.warranty,
                'return_policy': self.return_policy,
                'video_url': self.video_url,
                'images': [img.to_dict() for img in self.images],
                'variants': [v.to_dict() for v in self.variants],
                'specs': [s.to_dict() for s in self.specs],
                'reviews': [r.to_dict() for r in self.reviews if r.status == 'approved'],
                'questions': [q.to_dict() for q in self.questions]
            })

        return data

class ProductImage(db.Model):
    __tablename__ = 'product_images'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'image_url': self.image_url,
            'is_primary': self.is_primary
        }

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    size = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    sku = db.Column(db.String(50), nullable=True)
    stock_quantity = db.Column(db.Integer, default=10)
    price_override = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'size': self.size,
            'color': self.color,
            'sku': self.sku,
            'stock_quantity': self.stock_quantity,
            'price_override': self.price_override
        }

class ProductSpec(db.Model):
    __tablename__ = 'product_specs'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    key = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, default=1)

    product = db.relationship('Product', lazy=True)
    variant = db.relationship('ProductVariant', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'quantity': self.quantity,
            'product': self.product.to_dict() if self.product else None,
            'variant': self.variant.to_dict() if self.variant else None
        }

class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), default='Pending') # Pending, Confirmed, Processing, Packed, Shipped, Out for delivery, Delivered, Cancelled, Return requested, Returned, Refunded
    subtotal = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, default=0.0)
    shipping_fee = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    coupon_code = db.Column(db.String(50), nullable=True)
    shipping_address_json = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False) # Credit Card, UPI, Net Banking, Cash on Delivery
    payment_status = db.Column(db.String(20), default='Paid')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    history = db.relationship('OrderStatusHistory', backref='order', lazy=True, cascade="all, delete-orphan")
    return_request = db.relationship('ReturnRequest', backref='order', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else 'Guest',
            'user_email': self.user.email if self.user else '',
            'status': self.status,
            'subtotal': self.subtotal,
            'tax_amount': self.tax_amount,
            'shipping_fee': self.shipping_fee,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'coupon_code': self.coupon_code,
            'shipping_address': json.loads(self.shipping_address_json) if self.shipping_address_json else {},
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items],
            'history': [h.to_dict() for h in self.history],
            'return_request': self.return_request.to_dict() if self.return_request else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'), nullable=True)
    product_name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'product_name': self.product_name,
            'price': self.price,
            'quantity': self.quantity,
            'image_url': self.image_url
        }

class OrderStatusHistory(db.Model):
    __tablename__ = 'order_status_history'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'notes': self.notes,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.String(20), default='percentage') # percentage or fixed
    discount_value = db.Column(db.Float, nullable=False)
    min_order_amount = db.Column(db.Float, default=0.0)
    max_discount_amount = db.Column(db.Float, nullable=True)
    usage_limit = db.Column(db.Integer, default=100)
    times_used = db.Column(db.Integer, default=0)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'min_order_amount': self.min_order_amount,
            'max_discount_amount': self.max_discount_amount,
            'usage_limit': self.usage_limit,
            'times_used': self.times_used,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    is_verified_purchase = db.Column(db.Boolean, default=True)
    helpful_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='approved') # approved, pending, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else 'Anonymous',
            'user_avatar': self.user.avatar if self.user else None,
            'product_id': self.product_id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'is_verified_purchase': self.is_verified_purchase,
            'helpful_count': self.helpful_count,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProductQuestion(db.Model):
    __tablename__ = 'product_questions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=True)
    answered_by = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_name': self.user.full_name if self.user else 'Customer',
            'product_id': self.product_id,
            'question': self.question,
            'answer': self.answer,
            'answered_by': self.answered_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.String(100), nullable=False)
    comments = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Requested') # Requested, Approved, Rejected, Refunded
    refund_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'user_id': self.user_id,
            'reason': self.reason,
            'comments': self.comments,
            'status': self.status,
            'refund_amount': self.refund_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), default='order') # order, promo, account, stock
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'link': self.link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FAQ(db.Model):
    __tablename__ = 'faqs'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'question': self.question,
            'answer': self.answer,
            'display_order': self.display_order
        }

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='unread') # unread, read, replied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    summary = db.Column(db.String(500), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    author = db.Column(db.String(100), default='ShopSphere Team')
    category = db.Column(db.String(50), default='Guides')
    tags = db.Column(db.String(200), default='shopping,ecommerce')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'summary': self.summary,
            'content': self.content,
            'image_url': self.image_url,
            'author': self.author,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
