from datetime import datetime

from flask import Flask, request
from flask_cors import CORS
from flask_restful import Api, Resource

from . import dbaccess as db


# Helper function to attach all associated products to an order and format for JSON serialization
def addProductsToOrder(order):
    productList = []

    for product in order['products']:
        productId = product['productid']
        p = db.getProduct(productId)
        p['quantity'] = product['quantity']
        p['release_date'] = p['release_date'].strftime('%Y-%m-%d')
        productList.append(p)

    order['date'] = order['date'].strftime('%Y-%m-%d')
    order['products'] = productList

class Order(Resource):

    # Getting an order
    # Url formats
    # For a single order: `order?orderId=${orderId}`
    # For a single user: `order?userId=${userId}`
    # For all orders (admin use): `order`
    def get(self):
        print('Get order attempt received')
        orderId = request.args.get('orderId')
        userId = request.args.get('userId')

        if orderId is not None:
            order = db.getOrder(int(orderId))
            if order is None:
                return {'Error: Failed to get order'}
            else:
                addProductsToOrder(order)

            return {'order': order}

        elif userId is not None:
            orders = db.getUsersOrders(int(userId))
            if orders is None:
                return{'orders': None}
            else:
                for order in orders:
                    order['date'] = order['date'].strftime('%Y-%m-%d')

                return {'orders': orders}
        else:
            orders = db.getAllOrders()
            if orders is None:
                return{'orders': None}
            else:
                for order in orders:
                    order['date'] = order['date'].strftime('%Y-%m-%d')
                return {'orders': orders}



    # Making a payment/adding a new order
    # Url format: `order`
    def post(self):
        print('Order/Payment attempt received')
        data = request.json

        orderDate = datetime.today().strftime('%Y-%m-%d')
        userId = int(data.get('userId'))
        products = data.get('products')
        builds = data.get('builds')
        shipping = data.get('shipping')
        total = data.get('total') + data.get('shippingPrice')

        # For each build, get the parts and add them to the above dictionary
        for build in builds:
            for field in build['parts']:

                # Checking if the component has a product or is empty
                if isinstance(build['parts'][field], dict):
                    
                    # Add to exisitng quantity if the product was already in the cart
                    if ('id' in build['parts'][field]):
                        productid = str(build['parts'][field]['id'])
                    else:
                        productid = str(build['parts'][field]['productid'])

                    if productid in products:
                        products[productid] += build['quantity']
                    else:
                        products[productid] = build['quantity']

        # Add the order to the database
        orderId = db.addOrder(  userId, 
                                orderDate,
                                total, 
                                products,
                                shipping['address'],
                                shipping['city'],
                                shipping['postcode'],
                                shipping['state'],
                                shipping['country'])
        
        if orderId is None:
            return {'Error': 'Failed to make order'}
        
        return {'orderId': orderId}
