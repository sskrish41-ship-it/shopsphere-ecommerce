import os
import json
from datetime import datetime, timedelta
from app import create_app, db
from app.models import (
    User, Address, Category, Brand, Product, ProductImage, ProductVariant, 
    ProductSpec, Coupon, Review, ProductQuestion, FAQ, BlogPost, Order, 
    OrderItem, OrderStatusHistory, Notification, ContactMessage
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Resetting database tables for ShopSphere (INR Currency)...")
        db.drop_all()
        db.create_all()

        print("Creating Users...")
        admin = User(
            email='admin@shopsphere.com',
            full_name='System Admin',
            phone='+91 9876543210',
            role='admin',
            is_active=True,
            auth_provider='local',
            avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        )
        admin.set_password('Admin@123')

        customer = User(
            email='user@shopsphere.com',
            full_name='Alex Johnson',
            phone='+91 9812345678',
            role='user',
            is_active=True,
            auth_provider='local',
            avatar='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        )
        customer.set_password('User@123')

        db.session.add_all([admin, customer])
        db.session.flush()

        # Customer address
        addr = Address(
            user_id=customer.id,
            full_name='Alex Johnson',
            phone='+91 9812345678',
            street='MG Road, Sector 14',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560001',
            country='India',
            is_default=True
        )
        db.session.add(addr)

        print("Creating Categories...")
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics', 'icon': 'Cpu', 'image_url': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600', 'display_order': 1},
            {'name': 'Fashion', 'slug': 'fashion', 'icon': 'Shirt', 'image_url': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600', 'display_order': 2},
            {'name': 'Shoes', 'slug': 'shoes', 'icon': 'Footprints', 'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'display_order': 3},
            {'name': 'Beauty', 'slug': 'beauty', 'icon': 'Sparkles', 'image_url': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600', 'display_order': 4},
            {'name': 'Home & Kitchen', 'slug': 'home-kitchen', 'icon': 'Home', 'image_url': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', 'display_order': 5},
            {'name': 'Sports', 'slug': 'sports', 'icon': 'Activity', 'image_url': 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=600', 'display_order': 6},
            {'name': 'Accessories', 'slug': 'accessories', 'icon': 'Watch', 'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', 'display_order': 7},
            {'name': 'Grocery', 'slug': 'grocery', 'icon': 'ShoppingCart', 'image_url': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', 'display_order': 8},
            {'name': 'Books', 'slug': 'books', 'icon': 'BookOpen', 'image_url': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', 'display_order': 9},
            {'name': 'Gaming', 'slug': 'gaming', 'icon': 'Gamepad2', 'image_url': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600', 'display_order': 10}
        ]
        cat_objs = {}
        for c in categories_data:
            cat = Category(**c)
            db.session.add(cat)
            cat_objs[c['slug']] = cat

        print("Creating Brands...")
        brands_data = [
            {'name': 'Apple', 'slug': 'apple', 'logo_url': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=200', 'description': 'Innovating technology for everyday life.'},
            {'name': 'Samsung', 'slug': 'samsung', 'logo_url': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200', 'description': 'Inspire the world, create the future.'},
            {'name': 'Nike', 'slug': 'nike', 'logo_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', 'description': 'Just Do It. Premium athletic gear.'},
            {'name': 'Sony', 'slug': 'sony', 'logo_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200', 'description': 'Be moved. Next-gen audio and gaming.'},
            {'name': 'Adidas', 'slug': 'adidas', 'logo_url': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=200', 'description': 'Impossible is nothing.'},
            {'name': 'LG', 'slug': 'lg', 'logo_url': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=200', 'description': "Life's Good home appliances."},
            {'name': 'Bose', 'slug': 'bose', 'logo_url': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=200', 'description': 'Better sound through research.'},
            {'name': 'Philips', 'slug': 'philips', 'logo_url': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=200', 'description': 'Innovation and you.'}
        ]
        brand_objs = {}
        for b in brands_data:
            brand = Brand(**b)
            db.session.add(brand)
            brand_objs[b['slug']] = brand

        db.session.flush()

        print("Creating Products with INR Prices...")
        now = datetime.utcnow()
        deal_expiry = now + timedelta(days=2, hours=14, minutes=30)

        raw_products = [
            # Electronics
            {
                'name': 'Ultra Noise-Canceling Wireless Headphones Pro',
                'slug': 'ultra-noise-canceling-wireless-headphones-pro',
                'category': 'electronics', 'brand': 'bose',
                'price': 24999.00, 'original_price': 31999.00, 'stock': 45,
                'short_description': 'Industry-leading active noise cancellation with 30-hour battery life and spatial audio.',
                'description': 'Experience studio-quality audio with our flagship wireless headphones. Features hybrid ANC, custom tuned 40mm drivers, multipoint bluetooth connectivity, and plush memory foam earcups for all-day comfort.',
                'is_featured': True, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Midnight Black', 'Silver Frost', 'Deep Navy'],
                'specs': {'Battery': '30 Hours', 'Bluetooth': 'v5.3', 'Weight': '250g', 'ANC': 'Active Hybrid'}
            },
            {
                'name': 'SphereBook Pro M3 Max 16-inch Laptop',
                'slug': 'spherebook-pro-m3-max-16-inch-laptop',
                'category': 'electronics', 'brand': 'apple',
                'price': 189999.00, 'original_price': 219999.00, 'stock': 12,
                'short_description': 'Monster performance with liquid retina XDR screen and all-day battery.',
                'description': 'Designed for creators and developers. Powered by 16-core CPU, 40-core GPU, up to 128GB unified memory, and breathtaking 120Hz ProMotion display.',
                'is_featured': True, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'
                ],
                'sizes': ['512GB SSD', '1TB SSD', '2TB SSD'],
                'colors': ['Space Black', 'Silver'],
                'specs': {'Display': '16.2-inch Liquid Retina XDR', 'RAM': '36GB Unified', 'Weight': '2.14 kg'}
            },
            {
                'name': 'Galaxy Sphere Ultra 5G Smartphone 512GB',
                'slug': 'galaxy-sphere-ultra-5g-smartphone-512gb',
                'category': 'electronics', 'brand': 'samsung',
                'price': 119999.00, 'original_price': 139999.00, 'stock': 28,
                'short_description': '200MP camera system, titanium frame, and built-in S-Pen stylus.',
                'description': 'Capture life in phenomenal clarity with 200MP sensor, 100x Space Zoom, Snapdragon 8 Gen 3 for Galaxy, and an ultra-bright QHD+ AMOLED display.',
                'is_featured': True, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Titanium Black', 'Titanium Gray', 'Titanium Violet'],
                'specs': {'Screen': '6.8" QHD+ 120Hz', 'Camera': '200MP Main + 50MP Periscope', 'Battery': '5000 mAh'}
            },
            {
                'name': 'Curved OLED 4K Gaming Monitor 34-inch',
                'slug': 'curved-oled-4k-gaming-monitor-34-inch',
                'category': 'gaming', 'brand': 'lg',
                'price': 69999.00, 'original_price': 89999.00, 'stock': 15,
                'short_description': '0.03ms response time, 240Hz refresh rate, 1800R curve for ultimate immersion.',
                'description': 'Dominate every match with infinite contrast, 99% DCI-P3 color gamut, NVIDIA G-SYNC compatibility, and anti-glare OLED panel.',
                'is_featured': False, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Refresh Rate': '240Hz', 'Response Time': '0.03ms GTG', 'Curvature': '1800R'}
            },
            # Shoes & Fashion
            {
                'name': 'Air Zoom Speed Performance Running Shoes',
                'slug': 'air-zoom-speed-performance-running-shoes',
                'category': 'shoes', 'brand': 'nike',
                'price': 11999.00, 'original_price': 14999.00, 'stock': 60,
                'short_description': 'Responsive Zoom Air cushioning and breathable Flyknit upper for speed.',
                'description': 'Engineered for long-distance marathoners and daily runners alike. Provides energetic bounce with dual Zoom Air units and durable rubber traction sole.',
                'is_featured': True, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
                ],
                'sizes': ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
                'colors': ['Crimson Red', 'Neon Lime', 'Stealth Black'],
                'specs': {'Upper': 'Flyknit', 'Midsole': 'ZoomX Foam', 'Weight': '210g'}
            },
            {
                'name': 'Classic Ultraboost All-Day Sneaker',
                'slug': 'classic-ultraboost-all-day-sneaker',
                'category': 'shoes', 'brand': 'adidas',
                'price': 13999.00, 'original_price': 16999.00, 'stock': 40,
                'short_description': 'Lighter Boost midsole for endless energy return and cloudlike feel.',
                'description': 'Iconic street style meets high performance. Stretchweb outsole with Continental Rubber grips wet and dry surfaces effortlessly.',
                'is_featured': False, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800'
                ],
                'sizes': ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
                'colors': ['Cloud White', 'Core Black', 'Solar Blue'],
                'specs': {'Midsole': 'Boost', 'Outsole': 'Continental Rubber'}
            },
            {
                'name': 'Waterproof Alpine Explorer Outdoor Jacket',
                'slug': 'waterproof-alpine-explorer-outdoor-jacket',
                'category': 'fashion', 'brand': 'nike',
                'price': 15995.00, 'original_price': 19995.00, 'stock': 25,
                'short_description': '3-layer Gore-Tex fabric, taped seams, and underarm ventilation zips.',
                'description': 'Brave snow storms and torrential rains. Lightweight yet rugged construction keeps you warm and 100% dry on the trail or in the city.',
                'is_featured': False, 'is_trending': False, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'
                ],
                'sizes': ['S', 'M', 'L', 'XL'],
                'colors': ['Forest Green', 'Charcoal', 'Amber Orange'],
                'specs': {'Waterproofing': '20,000mm', 'Breathability': '15,000g'}
            },
            {
                'name': 'Designer Leather Chronograph Watch',
                'slug': 'designer-leather-chronograph-watch',
                'category': 'accessories', 'brand': 'apple',
                'price': 27900.00, 'original_price': 34900.00, 'stock': 18,
                'short_description': 'Genuine Italian leather strap with sapphire glass crystal face.',
                'description': 'Timeless elegance crafted with Japanese quartz movement, 50m water resistance, and luminous hands.',
                'is_featured': True, 'is_trending': False, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Cognac Brown', 'Obsidian Black'],
                'specs': {'Case Size': '42mm', 'Movement': 'Quartz Chronograph', 'Water Resistance': '5 ATM'}
            },
            # Home & Kitchen
            {
                'name': 'Smart Barista Espresso Machine with Milk Frother',
                'slug': 'smart-barista-espresso-machine-with-milk-frother',
                'category': 'home-kitchen', 'brand': 'philips',
                'price': 39999.00, 'original_price': 49999.00, 'stock': 22,
                'short_description': '19-bar Italian pump pressure, integrated conical burr grinder.',
                'description': 'Enjoy café-quality lattes and double espressos at home. Precise PID temperature control ensures gold-standard extraction every single cup.',
                'is_featured': True, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e8?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Stainless Steel', 'Matte Black'],
                'specs': {'Pressure': '19 Bar', 'Water Tank': '2.0 Liters', 'Grinder Settings': '15 Levels'}
            },
            {
                'name': 'Smart Robotic Vacuum & Mop Combo',
                'slug': 'smart-robotic-vacuum-and-mop-combo',
                'category': 'home-kitchen', 'brand': 'lg',
                'price': 29999.00, 'original_price': 39999.00, 'stock': 30,
                'short_description': 'LiDAR navigation, self-emptying base station, 6000Pa suction power.',
                'description': 'Effortlessly clean carpets and hardwood floors. Maps your entire home with pinpoint precision and avoids pet waste and cables automatically.',
                'is_featured': False, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Suction': '6000 Pa', 'Dustbin': '2.5L Auto-Empty', 'Battery': '180 Mins'}
            },
            # Beauty
            {
                'name': 'Hydrating Botanical Facial Serum (50ml)',
                'slug': 'hydrating-botanical-facial-serum-50ml',
                'category': 'beauty', 'brand': 'philips',
                'price': 4999.00, 'original_price': 6499.00, 'stock': 100,
                'short_description': 'Infused with Hyaluronic Acid, Vitamin C, and organic rosehip oil.',
                'description': 'Lock in moisture and reveal glowing skin. Deeply penetrates skin layers to boost collagen production and reduce fine lines in 14 days.',
                'is_featured': True, 'is_trending': False, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Volume': '50 ml / 1.7 fl. oz', 'Skin Type': 'All Skin Types', 'Paraben Free': 'Yes'}
            },
            {
                'name': 'Professional Ionic Hair Dryer & Styler',
                'slug': 'professional-ionic-hair-dryer-and-styler',
                'category': 'beauty', 'brand': 'philips',
                'price': 9999.00, 'original_price': 12999.00, 'stock': 35,
                'short_description': 'Ultra-fast drying without extreme heat damage.',
                'description': 'Negative ion technology seals hair cuticles to tame frizz and shine. Includes diffuser and magnetic styling concentrators.',
                'is_featured': False, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1522337240977-0630558dd945?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Rose Gold', 'Space Gray'],
                'specs': {'Motor Speed': '110,000 RPM', 'Wattage': '1600W'}
            },
            # Gaming & Accessories
            {
                'name': 'PlaySphere 5 Next-Gen Console Digital Edition',
                'slug': 'playsphere-5-next-gen-console-digital-edition',
                'category': 'gaming', 'brand': 'sony',
                'price': 49999.00, 'original_price': 54999.00, 'stock': 20,
                'short_description': 'Custom ultra-high speed SSD, haptic feedback controller, 4K 120Hz output.',
                'description': 'Experience lightning-fast loading and immersive 3D audio. Play stunning exclusives in native 4K with ray tracing enabled.',
                'is_featured': True, 'is_trending': True, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Pure White', 'Midnight Black'],
                'specs': {'Storage': '1TB NVMe SSD', 'Resolution': 'Up to 8K HDR', 'Controller': 'DualSense'}
            },
            {
                'name': 'Pro Wireless Mechanical Gaming Keyboard RGB',
                'slug': 'pro-wireless-mechanical-gaming-keyboard-rgb',
                'category': 'gaming', 'brand': 'sony',
                'price': 11999.00, 'original_price': 14999.00, 'stock': 50,
                'short_description': 'Hot-swappable tactile switches with per-key RGB backlighting.',
                'description': 'Zero latency 2.4GHz wireless connection. Double-shot PBT keycaps guarantee lifetime durability without fading.',
                'is_featured': False, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Switch Type': 'Mechanical Tactile Brown', 'Connectivity': '2.4GHz / BT / USB-C'}
            },
            # Sports & Books
            {
                'name': 'Smart Fitness Tracker Watch with GPS',
                'slug': 'smart-fitness-tracker-watch-with-gps',
                'category': 'sports', 'brand': 'samsung',
                'price': 13999.00, 'original_price': 17999.00, 'stock': 40,
                'short_description': 'Heart rate, SpO2, sleep tracking, 50+ workout modes, 7-day battery.',
                'description': 'Track your health and fitness goals effortlessly. Swimproof water resistance up to 50 meters and continuous stress monitoring.',
                'is_featured': False, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'
                ],
                'colors': ['Black Sport', 'Silver Milanese', 'Rose Pink'],
                'specs': {'Display': '1.4" AMOLED', 'Water Resistance': '50m Swimproof'}
            },
            {
                'name': 'Mastering Modern Web Architecture - Hardcover',
                'slug': 'mastering-modern-web-architecture-hardcover',
                'category': 'books', 'brand': 'apple',
                'price': 2499.00, 'original_price': 3299.00, 'stock': 85,
                'short_description': 'Comprehensive guide to building scalable, high-speed applications.',
                'description': 'Learn microservices, GraphQL, React Server Components, cloud scalability, and security best practices from industry veteran architects.',
                'is_featured': False, 'is_trending': False, 'is_deal': False,
                'images': [
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Pages': '620', 'Language': 'English', 'Format': 'Hardcover'}
            },
            {
                'name': 'Organic Artisanal Whole Bean Coffee Roast (1kg)',
                'slug': 'organic-artisanal-whole-bean-coffee-roast-1kg',
                'category': 'grocery', 'brand': 'philips',
                'price': 1499.00, 'original_price': 1999.00, 'stock': 120,
                'short_description': 'Single-origin 100% Arabica beans harvested from Ethiopian highlands.',
                'description': 'Medium roast featuring rich tasting notes of dark chocolate, toasted hazelnut, and sweet berry finish.',
                'is_featured': False, 'is_trending': True, 'is_deal': True,
                'images': [
                    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800'
                ],
                'specs': {'Weight': '1.0 kg', 'Roast Level': 'Medium Roast', 'Bean Type': '100% Arabica'}
            }
        ]

        # Duplicate product templates to generate 30+ unique products
        more_products = []
        for i in range(1, 15):
            base = raw_products[i % len(raw_products)]
            new_p = base.copy()
            new_p['name'] = f"{base['name']} - Edition {i}"
            new_p['slug'] = f"{base['slug']}-edition-{i}"
            new_p['price'] = round(base['price'] * (0.85 + (i * 0.03)), 0)
            new_p['original_price'] = round(new_p['price'] * 1.2, 0)
            new_p['stock'] = 10 + (i * 4)
            new_p['is_featured'] = (i % 3 == 0)
            new_p['is_trending'] = (i % 2 == 0)
            new_p['is_deal'] = (i % 4 == 0)
            more_products.append(new_p)

        all_product_dicts = raw_products + more_products

        for pdata in all_product_dicts:
            category_obj = cat_objs.get(pdata['category'])
            brand_obj = brand_objs.get(pdata['brand'])

            orig = pdata.get('original_price', pdata['price'])
            price = pdata['price']
            discount = int(((orig - price) / orig) * 100) if orig > price else 0

            prod = Product(
                name=pdata['name'],
                slug=pdata['slug'],
                category_id=category_obj.id if category_obj else list(cat_objs.values())[0].id,
                brand_id=brand_obj.id if brand_obj else list(brand_objs.values())[0].id,
                description=pdata.get('description', 'High performance product.'),
                short_description=pdata.get('short_description', pdata['name']),
                price=price,
                original_price=orig,
                discount_percent=discount,
                stock_quantity=pdata.get('stock', 15),
                sku=f"SKU-{pdata['slug'][:10].upper()}-{pdata.get('stock', 10)}",
                is_featured=pdata.get('is_featured', False),
                is_trending=pdata.get('is_trending', False),
                is_deal=pdata.get('is_deal', False),
                deal_end_time=deal_expiry if pdata.get('is_deal') else None,
                status='active',
                rating=round(4.0 + (hash(pdata['name']) % 10) / 10.0, 1),
                review_count=12 + (hash(pdata['name']) % 45)
            )
            db.session.add(prod)
            db.session.flush()

            # Images
            imgs = pdata.get('images', ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'])
            for idx, img_url in enumerate(imgs):
                db.session.add(ProductImage(product_id=prod.id, image_url=img_url, is_primary=(idx == 0)))

            # Variants
            if 'sizes' in pdata:
                for sz in pdata['sizes']:
                    db.session.add(ProductVariant(product_id=prod.id, size=sz, stock_quantity=10))
            if 'colors' in pdata:
                for clr in pdata['colors']:
                    db.session.add(ProductVariant(product_id=prod.id, color=clr, stock_quantity=10))

            # Specs
            if 'specs' in pdata:
                for k, v in pdata['specs'].items():
                    db.session.add(ProductSpec(product_id=prod.id, key=k, value=str(v)))

        db.session.flush()

        print("Creating Coupons...")
        coupons = [
            Coupon(code='WELCOME10', discount_type='percentage', discount_value=10.0, min_order_amount=999.0, is_active=True),
            Coupon(code='FLASHSALE20', discount_type='percentage', discount_value=20.0, min_order_amount=2499.0, max_discount_amount=5000.0, is_active=True),
            Coupon(code='SAVEMORE500', discount_type='fixed', discount_value=500.0, min_order_amount=4999.0, is_active=True),
        ]
        db.session.add_all(coupons)

        print("Creating Sample Reviews...")
        first_product = Product.query.first()
        if first_product:
            reviews = [
                Review(user_id=customer.id, product_id=first_product.id, rating=5, title='Mind-Blowing Audio Quality!', comment='The active noise cancellation is stunning. Zero ambient noise in airplane flights. Highly recommended!', is_verified_purchase=True, helpful_count=18, status='approved'),
                Review(user_id=customer.id, product_id=first_product.id, rating=4, title='Great comfort, fast shipping', comment='Super comfortable cushions. Battery life easily lasts my entire work week.', is_verified_purchase=True, helpful_count=9, status='approved')
            ]
            db.session.add_all(reviews)

            pq = ProductQuestion(user_id=customer.id, product_id=first_product.id, question='Can these headphones connect to a TV and laptop at the same time?', answer='Yes! Multi-point Bluetooth allows simultaneous pairing with up to two devices.', answered_by='ShopSphere Support')
            db.session.add(pq)

        print("Creating Sample Orders & History...")
        sample_order = Order(
            order_number='ORD-20260909-883921',
            user_id=customer.id,
            status='Out for delivery',
            subtotal=24999.00,
            tax_amount=2000.00,
            shipping_fee=0.0,
            discount_amount=2499.00,
            total_amount=24500.00,
            coupon_code='WELCOME10',
            shipping_address_json=json.dumps({
                'full_name': 'Alex Johnson',
                'phone': '+91 9812345678',
                'street': 'MG Road, Sector 14',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
                'country': 'India'
            }),
            payment_method='Credit Card',
            payment_status='Paid'
        )
        db.session.add(sample_order)
        db.session.flush()

        if first_product:
            db.session.add(OrderItem(
                order_id=sample_order.id,
                product_id=first_product.id,
                product_name=first_product.name,
                price=first_product.price,
                quantity=1,
                image_url=first_product.images[0].image_url if first_product.images else ''
            ))

        statuses = [
            ('Pending', 'Order placed by customer', now - timedelta(days=3)),
            ('Confirmed', 'Payment verified successfully', now - timedelta(days=3, hours=-1)),
            ('Processing', 'Items picked at warehouse', now - timedelta(days=2)),
            ('Packed', 'Parcel packaged with eco-friendly wrap', now - timedelta(days=1)),
            ('Shipped', 'Handed over to BlueDart Express courier', now - timedelta(hours=12)),
            ('Out for delivery', 'Courier driver is on the way to delivery address', now - timedelta(hours=2))
        ]
        for st, notes, ts in statuses:
            db.session.add(OrderStatusHistory(order_id=sample_order.id, status=st, notes=notes, timestamp=ts))

        print("Creating FAQs...")
        faqs_data = [
            {'category': 'Orders', 'question': 'How can I track my order status?', 'answer': 'You can track your order status in real time under My Account -> Orders, or by clicking the tracking link sent to your registered email.', 'display_order': 1},
            {'category': 'Shipping', 'question': 'What are the delivery times and shipping costs?', 'answer': 'Standard shipping takes 3-5 business days and is FREE on all orders over ₹1,999. Express 2-day shipping is available at checkout.', 'display_order': 2},
            {'category': 'Returns', 'question': 'What is the return policy?', 'answer': 'We offer a hassle-free 30-day money-back guarantee. If you are not satisfied, submit a return request from your order history.', 'display_order': 3},
            {'category': 'Payments', 'question': 'What payment methods do you accept?', 'answer': 'We accept Visa, MasterCard, UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD).', 'display_order': 4}
        ]
        for f in faqs_data:
            db.session.add(FAQ(**f))

        print("Creating Blog Posts...")
        blogs_data = [
            {
                'title': 'The Ultimate Guide to Choosing Noise-Canceling Headphones in 2026',
                'slug': 'ultimate-guide-to-noise-canceling-headphones-2026',
                'summary': 'Compare active vs passive noise cancellation, codec support, and spatial audio features before buying your next headset.',
                'content': 'Selecting the right headphones can transform your daily commute or focus sessions. In this guide, we break down ANC algorithms, battery longevity, driver materials, and multi-device pairing.',
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
                'author': 'Sarah Jenkins', 'category': 'Audio Tech', 'tags': 'headphones,anc,audio,guides'
            },
            {
                'title': 'Top 10 Ergonomic Desk Setup Essentials for Remote Workers',
                'slug': 'top-10-ergonomic-desk-setup-essentials-remote-workers',
                'summary': 'Prevent back pain and boost productivity with our curated guide to desks, monitors, and ambient lighting.',
                'content': 'Working remotely requires a comfortable space that supports posture. We highlight curved OLED monitors, mechanical switches, and lumbar support chairs.',
                'image_url': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
                'author': 'Mark Rivera', 'category': 'Workplace', 'tags': 'setup,productivity,tech'
            }
        ]
        for b in blogs_data:
            db.session.add(BlogPost(**b))

        db.session.commit()
        print("Database successfully seeded with INR prices!")

if __name__ == '__main__':
    seed_database()
