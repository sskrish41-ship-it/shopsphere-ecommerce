from flask import Blueprint, jsonify
from app.models import Brand

brands_bp = Blueprint('brands', __name__)

@brands_bp.route('', methods=['GET'])
def get_brands():
    brands = Brand.query.order_by(Brand.name.asc()).all()
    return jsonify({'brands': [b.to_dict() for b in brands]}), 200

@brands_bp.route('/<string:slug>', methods=['GET'])
def get_brand_by_slug(slug):
    brand = Brand.query.filter_by(slug=slug).first_or_404()
    return jsonify({'brand': brand.to_dict()}), 200
