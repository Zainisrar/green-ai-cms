# Navigation Database Setup Guide

## ✅ YES, Your Schema Will Work!

Your schema **DOES** support your hierarchical `rowData` payload structure. However, you need to understand how to properly insert and query hierarchical data.

## 📋 Schema Overview

```typescript
export const navigation = pgTable("navigation", {
  id: serial("id").primaryKey(),           // ✅ Auto-generated
  name: text("name").notNull(),            // ✅ Matches your data
  slug: text("slug").notNull(),            // ✅ Matches your data
  top: boolean("top").default(false),      // ✅ Matches your data
  accessor: text("accessor"),              // ✅ For top-level items
  accesor: text("accesor"),                // ✅ For nested items (typo support)
  image: jsonb("image").$type<...>(),      // ✅ Stores {src, alt}
  text: jsonb("text").$type<...>(),        // ✅ Stores {description, highlighted}
  parentId: integer("parent_id"),          // ✅ For hierarchy (instead of children)
});
```

## 🔑 Key Understanding

### Your Payload Has `children`:
```javascript
{
  id: 1,
  name: 'EXPLORE',
  children: [...]  // ← This is for display/API responses
}
```

### Database Uses `parentId`:
```sql
id | name    | parentId
1  | EXPLORE | NULL      ← Top level
2  | Child1  | 1         ← Child of EXPLORE
3  | Child2  | 1         ← Child of EXPLORE
```

## 🚀 How to Use

### 1. Setup Environment

Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"
```

### 2. Install Dependencies

```bash
pnpm install drizzle-orm pg @types/pg
pnpm install -D drizzle-kit
```

### 3. Push Schema to Database

```bash
pnpx drizzle-kit push:pg
```

### 4. Insert Your Data

#### Option A: Via API (Recommended)

```typescript
// POST to /api/navigation
const response = await fetch('/api/navigation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(rowData), // Your hierarchical data
});
```

#### Option B: Direct Seed Script

```bash
# Run the seed script
tsx db/seed-navigation.example.ts
```

#### Option C: In Your Code

```typescript
import { insertNavigationHierarchy } from '@/db/navigation-utils';
import { db } from '@/db';

await insertNavigationHierarchy(db, rowData);
```

### 5. Query Data

#### Get All Navigation (Flat)
```typescript
import { db } from '@/db';
import { navigation } from '@/db/schema';

const items = await db.select().from(navigation);
```

#### Get Hierarchical Tree
```typescript
import { db } from '@/db';
import { navigation } from '@/db/schema';
import { buildNavigationTree } from '@/db/navigation-utils';

const flatItems = await db.select().from(navigation);
const tree = buildNavigationTree(flatItems);
// Returns: [{ id: 1, name: 'EXPLORE', children: [...] }]
```

#### Get via API
```typescript
// GET /api/navigation
const response = await fetch('/api/navigation');
const { data } = await response.json();
// data is already hierarchical
```

## 📁 Files Created

1. **`db/schema.ts`** - Database schema definition
2. **`db/index.ts`** - Database connection
3. **`db/navigation-utils.ts`** - Helper functions for hierarchy
4. **`app/(apis)/api/navigation/route.ts`** - API endpoints
5. **`db/seed-navigation.example.ts`** - Example seed script

## 🔄 Data Flow

### Insertion Flow:
```
rowData (with children)
    ↓
insertNavigationHierarchy()
    ↓
Flattens hierarchy + sets parentId
    ↓
Inserts into PostgreSQL
```

### Query Flow:
```
PostgreSQL (flat with parentId)
    ↓
buildNavigationTree()
    ↓
Hierarchical structure (with children)
    ↓
Your components
```

## 🎯 API Endpoints

### GET `/api/navigation`
Returns all navigation as hierarchical tree

### POST `/api/navigation`
Insert navigation items (handles hierarchy automatically)

**Body:**
```json
[
  {
    "name": "EXPLORE",
    "slug": "/explore",
    "top": true,
    "children": [...]
  }
]
```

### DELETE `/api/navigation?id=1`
Delete a navigation item (and its children)

## ⚠️ Important Notes

1. **Don't include `id` when inserting** - PostgreSQL auto-generates it
2. **Use `parentId` in DB, `children` in API** - Utilities handle conversion
3. **Both `accessor` and `accesor` supported** - Schema has both fields
4. **Hierarchical operations are automatic** - Just use the utility functions

## 🧪 Testing

```typescript
// Test insertion
await insertNavigationHierarchy(db, [{
  name: 'Test',
  slug: '/test',
  children: [{
    name: 'Child',
    slug: '/test/child'
  }]
}]);

// Test query
const tree = await fetch('/api/navigation').then(r => r.json());
console.log(tree.data); // Should show hierarchical structure
```

## 🔧 Troubleshooting

### "Cannot find module '@/db'"
- Make sure `db/index.ts` exists
- Restart your dev server
- Check `tsconfig.json` has `"@/*": ["./*"]` in paths

### "Database connection failed"
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify database exists

### "Schema not synced"
- Run `pnpx drizzle-kit push:pg`
- Or use Prisma/other migration tools

## 📚 Next Steps

1. Set up your PostgreSQL database
2. Add `DATABASE_URL` to `.env.local`
3. Run schema push: `pnpx drizzle-kit push:pg`
4. Seed with your data: `tsx db/seed-navigation.example.ts`
5. Use the API endpoints in your components

---

**Summary:** Yes, your schema matches your data structure perfectly! The utilities handle the conversion between hierarchical (children) and relational (parentId) formats automatically.
