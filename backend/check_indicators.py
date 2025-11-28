"""Quick script to check if indicators exist in the database"""
from database import get_db, engine
from models import Indicator
from sqlalchemy.orm import Session

db = next(get_db())
try:
    count = db.query(Indicator).count()
    print(f"Total indicators in database: {count}")
    
    if count > 0:
        indicators = db.query(Indicator).all()
        print("\nIndicators found:")
        for ind in indicators:
            print(f"  - {ind.code}: {ind.name}")
    else:
        print("\nNo indicators found! Database needs to be seeded.")
finally:
    db.close()

