# StartupEvents — MongoDB Shell Commands Reference

> **Syllabus: BE Unit IV** — MongoDB terminology, shell commands, CRUD operations

## Terminology

| Term | Description |
|---|---|
| **Database** | `startupevents` — container for all collections |
| **Collection** | Like a table: `events`, `users`, `rsvps` |
| **Document** | Like a row: a single JSON object in a collection |
| **Field** | Like a column: a key-value pair in a document |

## Connect to MongoDB Shell

```bash
# Start mongosh
mongosh

# Or connect to a specific database
mongosh mongodb://localhost:27017/startupevents
```

## Database Commands

```javascript
// Show all databases
show dbs

// Create/switch to database
use startupevents

// Show current database
db

// Drop database (CAUTION!)
db.dropDatabase()
```

## Collection Commands

```javascript
// Show all collections
show collections

// Create collection
db.createCollection("events")

// Drop collection
db.events.drop()
```

## CRUD Operations

### Create (Insert)

```javascript
// Insert one document
db.events.insertOne({
  title: "Demo Hackathon",
  category: "hackathon",
  date: new Date("2026-07-01"),
  location: { city: "Bangalore", venue: "TechHub" },
  capacity: 100,
  status: "upcoming"
})

// Insert many documents
db.events.insertMany([
  { title: "Event 1", category: "meetup", capacity: 50 },
  { title: "Event 2", category: "workshop", capacity: 30 }
])
```

### Read (Find)

```javascript
// Find all documents
db.events.find()

// Find with filter
db.events.find({ category: "hackathon" })

// Find one document
db.events.findOne({ title: "Demo Hackathon" })

// Find with projection (select specific fields)
db.events.find({}, { title: 1, category: 1, _id: 0 })

// Find with conditions
db.events.find({ capacity: { $gte: 100 } })          // >= 100
db.events.find({ category: { $in: ["hackathon", "workshop"] } })
db.events.find({ date: { $gt: new Date() } })          // Future events

// Sort, skip, limit (pagination)
db.events.find().sort({ date: 1 }).skip(0).limit(10)

// Count documents
db.events.countDocuments({ category: "hackathon" })

// Text search (requires text index)
db.events.find({ $text: { $search: "hackathon AI" } })
```

### Update

```javascript
// Update one document
db.events.updateOne(
  { title: "Demo Hackathon" },
  { $set: { capacity: 200, status: "ongoing" } }
)

// Update many documents
db.events.updateMany(
  { status: "upcoming", date: { $lt: new Date() } },
  { $set: { status: "completed" } }
)

// Add to array
db.events.updateOne(
  { _id: ObjectId("...") },
  { $push: { tags: "new-tag" } }
)

// Increment a field
db.events.updateOne(
  { _id: ObjectId("...") },
  { $inc: { capacity: 50 } }
)
```

### Delete

```javascript
// Delete one document
db.events.deleteOne({ title: "Demo Hackathon" })

// Delete many documents
db.events.deleteMany({ status: "cancelled" })
```

## Indexes

```javascript
// Create index
db.events.createIndex({ date: 1 })

// Create text index for search
db.events.createIndex({ title: "text", description: "text", tags: "text" })

// View indexes
db.events.getIndexes()

// Drop index
db.events.dropIndex("date_1")
```

## Aggregation (Bonus)

```javascript
// Count events by category
db.events.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Average capacity by category
db.events.aggregate([
  { $group: { _id: "$category", avgCapacity: { $avg: "$capacity" } } }
])
```
