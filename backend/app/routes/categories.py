from flask import Blueprint, jsonify
from app.models import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.display_order.asc(), Category.name.asc()).all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200

@categories_bp.route('/<string:slug>', methods=['GET'])
def get_category_by_slug(slug):
    category = Category.query.filter_by(slug=slug).first_or_404()
    return jsonify({'category': category.to_dict()}), 200
