from flask import Blueprint, jsonify
from app.models import FAQ

faqs_bp = Blueprint('faqs', __name__)

@faqs_bp.route('', methods=['GET'])
def get_faqs():
    faqs = FAQ.query.order_by(FAQ.display_order.asc()).all()
    categories = sorted(list(set(f.category for f in faqs)))
    return jsonify({
        'faqs': [f.to_dict() for f in faqs],
        'categories': categories
    }), 200
