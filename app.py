from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

# Configure MySQL database connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://username:password@localhost/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define Models
class Store(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    invoices = db.relationship('Invoice', backref='store', lazy=True)

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)

class Driver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    van = db.Column(db.String(10), nullable=False)
    imageUrl = db.Column(db.String(255))
    stores = db.relationship('Store', secondary='driver_store', lazy='subquery',
        backref=db.backref('drivers', lazy=True))

# Define the association table between drivers and stores
driver_store = db.Table('driver_store',
    db.Column('driver_id', db.Integer, db.ForeignKey('driver.id'), primary_key=True),
    db.Column('store_id', db.Integer, db.ForeignKey('store.id'), primary_key=True)
)

# Create endpoints
@app.route('/api/stores', methods=['GET'])
def get_stores():
    stores = Store.query.all()
    return jsonify([{
        "id": store.id,
        "name": store.name,
        "invoices": [{"id": invoice.code} for invoice in store.invoices]
    } for store in stores])

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    drivers = Driver.query.all()
    return jsonify([{
        "id": driver.id,
        "name": driver.name,
        "van": driver.van,
        "stores": [{"id": store.id, "name": store.name} for store in driver.stores],
        "imageUrl": driver.imageUrl
    } for driver in drivers])

if __name__ == '__main__':
    app.run(debug=True)
