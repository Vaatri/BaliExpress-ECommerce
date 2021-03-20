import psycopg2
from psycopg2.extensions import AsIs

def connect():
    conn = None
    try:
        conn = psycopg2.connect(database="baliexpress",
        user="postgres",
        password="asdf1234"
    )
        conn.set_client_encoding('UTF8')
    except Exception as e:
        print("Unable to connect to the database")

    return conn

# "Users" table functions
# returns all db info for a given id
# TODO: make less hard coded, tidy up
def getUserInfo(id):
    conn = connect()
    cur = conn.cursor()

    print('id:', id)

    cur.execute(
    	"SELECT * FROM Users WHERE id = %s", [id]
    )

    try:
        tuple = cur.fetchall()[0]
        info = {
            "id": tuple[0],
            "name": tuple[1],
            "email": tuple[2],
            "password": tuple[3],
            "phone": tuple[4],
            "streetAddress": tuple[5],
            "city": tuple[6],
            "state": tuple[7],
            "country": tuple[8],
            "postcode": tuple[9],
            "admin": tuple[10]
        }
    except IndexError:
        info = None

    cur.close()
    conn.close()
    return info

#TODO: make less hard coded, tidy up
def getAllUsers():
    conn = connect()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM Users"
    )

    users = []
    while True:
        tuple = cur.fetchone()
        if tuple == None:
            break
        info = {
            "id": tuple[0],
            "name": tuple[1],
            "email": tuple[2],
            "password": tuple[3],
            "phone": tuple[4],
            "streetAddress": tuple[5],
            "city": tuple[6],
            "state": tuple[7],
            "country": tuple[8],
            "pCode": tuple[9],
            "admin": tuple[10]
        }
        users.append(info)

    cur.close()
    conn.close()
    return users



# returns the corresponding password for a given user ID
# NOTE: likely a very insecure way of doing this
def getPassword(id):
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT password FROM Users WHERE id = %s", [id]
    )
    password = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return password

# returns the corresponding email for a given user id
def getEmail(id):
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT email FROM Users WHERE id = %s", [id]
    )
    email = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return email

# returns the corresponding user id for a given email
def getUserIDFromEmail(email):
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT id FROM Users WHERE email = %s", [email]
    )

    try:
        id = cur.fetchall()[0][0]
    except IndexError:
        id = None
    cur.close()
    conn.close()
    return id

# returns the corresponding address for a given user id
def getAddress(id):
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT streetaddress, city, country, postcode FROM Users WHERE id = %s", [id]
    )
    address = cur.fetchall()[0]
    cur.close()
    conn.close()
    return address

# returns whether or not a given user is an admin
def getAdminStatus(id):
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT admin FROM Users WHERE id = %s", [id]
    )
    admin = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return admin

# creates a new user from given paramters
# Note: id does not need to be specified, database generates it automatically
def addUser(name, password, email, phonenumber):
    conn = connect()
    cur = conn.cursor()

    query =  """INSERT INTO Users (id, name, email, password, phonenumber, admin) VALUES (DEFAULT, %s, %s, %s, %s, 'f');"""
    values = (name, password, email, phonenumber)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()
    #TODO: error handling

# creates a new user with admin permissions from given parameters
# NOTE: id does not need to be specified, database generates it automatically
def addAdmin(name, password, email, phonenumber):
    conn = connect()
    cur = conn.cursor()

    query =  """INSERT INTO Users (id, name,  email, password, phonenumber, admin) VALUES (DEFAULT, %s, %s, %s, %s, 't');"""
    values = (name, password, email, phonenumber)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()
    print("Admin succesfully added")
    #TODO: error handling

def updateUser(id, newName, newEmail, newPassword, newPhoneNumber, newStreetAddress, newCity, newState, newCountry, newPostcode):
    conn = connect()
    cur = conn.cursor()

    query =  """UPDATE Users SET name = %s, email = %s, password = %s, phonenumber = %s, streetaddress = %s, city = %s, state = %s, country = %s, postcode = %s WHERE id = %s;"""
    values = (newName, newEmail, newPassword, newPhoneNumber, newStreetAddress, newCity, newState, newCountry, newPostcode, id)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()
    print("User succesfully updated")
    #TODO: error handling

# updates password of user with given id
def updatePassword(id, newPassword):
    conn = connect()
    cur = conn.cursor()

    query =  """UPDATE Users SET password = %s WHERE id = %s;"""
    values = (newPassword, id)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()

# updates email of user with given id
def updateEmail(id, newEmail):
    conn = connect()
    cur = conn.cursor()

    query =  """UPDATE Users SET email = %s WHERE id = %s;"""
    values = (newEmail, id)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()

# updates address of user with given id
# TODO: allow update of individual elements of address
def updateAddress(id, streetAddress, city, country, postcode):
    conn = connect()
    cur = conn.cursor()

    query =  """UPDATE Users SET streetaddress = %s, city = %s, country = %s, postcode = %s WHERE id = %s;"""
    values = (streetAddress, city, country, postcode, id)

    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()

# product functions
# get all product categories
def getCategories():
    conn = connect()
    cur = conn.cursor()

    cur.execute(
    	"SELECT unnest(enum_range(NULL::Categories));"
    )

    categories = []
    while True:
        t = cur.fetchone()
        if t == None:
            break
        categories.append(t[0])

    cur.close()
    conn.close()
    return categories



# get all products of a specific category
# returns a dictionary that stores all product information as a dictionary
# specs are stored in a dictionary within the dictionary with the key "specs"
# TODO: tidy
def getAllProducts(*args):

    decimalToFloat = psycopg2.extensions.new_type(
        psycopg2.extensions.DECIMAL.values,
        'decimalToFloat',
        lambda num, cur: float(num) if num is not None else None
    )  
    psycopg2.extensions.register_type(decimalToFloat)

    # get all products of all categories
    if not args:
        try:
            conn = connect()
            cur = conn.cursor()
            # get product table column names
            productColumns = getColumns(cur, 'Products')

            #get get category table column names
            categories = getCategories()
            categoryColumns = {}
            for category in categories:
                columns = getColumns(cur, category)
                categoryColumns[category] = columns

            # get product details from Products table
            cur.execute(
            	"SELECT * from Products;"
            )

            products = []
            tuple = cur.fetchone()
            while tuple != None:
                info = {}
                print("first")
                for i in range(0, len(productColumns)):
                    info[productColumns[i]] = tuple[i]
                products.append(info)
                tuple = cur.fetchone()

            # get product specs from individual category tables
            print("second")
            for i in range(0, len(products)):
                product = products[i]
                id = product['id']
                category = product['category']
                query = "SELECT * FROM " + category + " WHERE id = %s;"
                cur.execute(query, [id])
                tuple = cur.fetchone()
                # create dictionary of specs
                specs = {}
                print("third")
                print(tuple)
                for j in range(1, len(tuple)):
                    columns = categoryColumns[category]
                    specs[columns[j]] = tuple[j]
                product['specs'] = specs
                products[i] = product
            conn.commit()
            cur.close()

        except (Exception, psycopg2.DatabaseError) as error:
            products = None
            print ("An error has occured: ")
            print (error)
        finally:
            conn.close()
            return products
    elif len(args) == 1:
        try:
            category = args[0]
            print('finding category:', category)
            conn = connect()
            cur = conn.cursor()
            # get column names
            cur.execute(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' ORDER BY ORDINAL_POSITION"
            )
            productColumns = []
            t = cur.fetchone()
            while t != None:
                productColumns.append(t[0])
                t = cur.fetchone()

            cur.execute(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s ORDER BY ORDINAL_POSITION", [category.lower()]
            )
            categoryColumns = []
            t = cur.fetchone()
            while t != None:
                categoryColumns.append(t[0])
                t = cur.fetchone()


            # get product details from Products table
            cur.execute(
            	"SELECT * FROM Products WHERE category = %s;", [category]
            )

            products = []
            tuple = cur.fetchone()
            while tuple != None:
                info = {}

                for i in range(0, len(productColumns)):
                    info[productColumns[i]] = tuple[i]
                products.append(info)
                tuple = cur.fetchone()

            # get product specs from individual category tables

            for i in range(0, len(products)):
                product = products[i]
                id = product['id']
                category = product['category']
                query = "SELECT * FROM " + category + " WHERE id = %s;"
                cur.execute(query, [id])
                tuple = cur.fetchone()
                # create dictionary of specs
                specs = {}
                for j in range(1, len(tuple)):
                    specs[categoryColumns[j]] = tuple[j]
                product['specs'] = specs
                products[i] = product
            conn.commit()
            cur.close()

        except (Exception, psycopg2.DatabaseError) as error:
            deleted = 0
            print ("An error has occured: ")
            print (error)
        finally:
            conn.close()
            return products
    else:
        print('incorrect number of function arguments')
        return None

#TODO: tidy
def getProduct(id):
    try:
        conn = connect()
        cur = conn.cursor()

        productColumns = getColumns(cur, "products")
        cur.execute(
        	"SELECT * FROM Products WHERE id = %s", [id]
        )
        product = {}

        t = cur.fetchone()

        for i in range(0, len(productColumns)):
            product[productColumns[i]] = t[i]

        # get category COLUMNS
        categoryColumns = getColumns(cur, product['category'])
        query = "SELECT * FROM " + product['category'] + " WHERE id = %s"
        cur.execute(query, [id])
        t = cur.fetchone()
        specs = {}
        for i in range(0, len(categoryColumns)):
            specs[categoryColumns[i]] = t[i]
        product['specs'] = specs
    except (Exception, psycopg2.DatabaseError) as error:
        print ("An error has occured: ")
        print (error)
        product = None
    finally:
        cur.close()
        conn.close()
        return product

# adds a product to the Database
# returns 1 if successful, 0 otherwise
# item should be passed in as a dictionary
# eg {name: "product name", price: "666.66",  type: "CPU", image: "whatever we're doing for images", description: "description text", stock: "500", specs: {manufacturer: "whoever", corecount:"6"}}
# please do not pass in an id, it is generated automatically
def addProduct(newProduct):
    print("product to add:", newProduct)
    try:
        conn = connect()
        cur = conn.cursor()

        # extract specs from dictionary
        specs = newProduct['specs']
        newProduct.pop('specs')

        # insert into product table
        columns = newProduct.keys()
        values = [newProduct[column] for column in columns]
        query = 'INSERT INTO Products (%s) values %s RETURNING id'
        cur.execute(query, (AsIs(','.join(columns)), tuple(values)))

        # get generated id of added item
        id = cur.fetchone()[0]
        specs['id'] = id

        # insert into category table
        category = newProduct['category']
        columns = specs.keys()
        values = [specs[column] for column in columns]
        query = 'INSERT INTO %s (%s) values %s RETURNING id'
        cur.execute(query, (AsIs(category), AsIs(','.join(columns)), tuple(values)))



        conn.commit()
        cur.close()
        added = 1

    except (Exception, psycopg2.DatabaseError) as error:
        print("An error has occured")
        print (error)
        id = None
        added = 0

    finally:
        print("Item successfully added")
        conn.close()
        return id

# returns 1 if successful, 0 if unsuccessful. If it returns something greater
# than 1, something has gone seriously wrong
def deleteProduct(id):
    try:
        conn = connect()
        cur = conn.cursor()

        cur.execute(
        	"DELETE FROM Products WHERE id = %s", [id]
        )
        deleted = cur.rowcount

        conn.commit()
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        deleted = 0
        print (error)
    finally:
        conn.close()
        return deleted

#helper functions
def getColumns(cur, table):
    cur.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s ORDER BY ORDINAL_POSITION", [table.lower()]
    )
    columns = []
    t = cur.fetchone()
    while t != None:
        columns.append(t[0])
        t = cur.fetchone()
    return columns

# def getProductColumns(cur):
#     cur.execute(
#         "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' ORDER BY ORDINAL_POSITION"
#     )
#     productColumns = []
#     t = cur.fetchone()
#     while t != None:
#         productColumns.append(t[0])
#         t = cur.fetchone()
#     return productColumns
#
# def getCategoryColumns(cur, category):
#     cur.execute(
#         "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s ORDER BY ORDINAL_POSITION", [category.lower()]
#     )
#     columns = []
#     t = cur.fetchone()
#     while t != None:
#         columns.append(t[0])
#         t = cur.fetchone()
#     return columns


# addUser('anne', 'anne@email.com', 'passowrd', '3124124')
# addAdmin('Jo', 'Jo@email.com', 'newpw', '55555555')
# updateUser(1, 'Cry', 'hi@gmail.com', 'hello', 12344321, '10outoften street', 'new york', 'texas', 'earth', '2431')
# # print(deleteProduct(50))
# # print("user 1:", getUserInfo(1))
# print(getProduct(1))
# print(getAllProducts('CPU'))
# print(getAllProducts())
# print("Get user info: ")
# print( getUserInfo(2))
# print("Get all users:")
# print(getAllUsers())

#spec = {'id':12, 'num_fans':9, 'power_use':2}
# item = {'name': 'fully sick cpu', 'category':'CPU', 'brand': 'real brand', 'price': 9999999.99, 'warranty': 'nah', 'description': 'a real product', 'stock': '5', 'specs': spec}
# print(addProduct(item))
#print(getAllProducts())

# cpu = { 'name': 'fuly sick cpu',
#         'category': 'CPU',
#         'brand': 'supreme',
#         'price': 199.99,
#         'image': '',
#         'warranty': '1 year',
#         'description': 'lit',
#         'stock': 525,
#         'specs': {  'cores': 8,
#                     'threads': 16,
#                     'base_clock': 6.0,
#                     'max_clock': 6.4,
#                     'socket': 'your mum',
#                     'cooler_included': True,
#                     'overclockable': True,
#                     'power_use': 100.2,
#         }}

# print(addProduct(cpu))
# print(deleteProduct(12))
# print(getUserInfo(1))
# print(getAllProducts('CPU'))