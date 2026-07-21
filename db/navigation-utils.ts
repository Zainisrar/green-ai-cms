// Navigation utility functions for flattening and inserting hierarchical data

import { navigation } from './schema';

export interface NavItem {
  id?: number; // Optional because DB auto-generates
  name: string;
  slug: string;
  top?: boolean;
  accessor?: string;
  accesor?: string;
  image?: {
    src: string;
    alt: string;
  } | null;
  text?: {
    description: string;
    highlighted: string;
  } | null;
  children?: NavItem[];
}

export type NavInsert = typeof navigation.$inferInsert;

/**
 * Flattens a hierarchical navigation structure into a flat array
 * suitable for database insertion.
 * 
 * @param items - Array of navigation items with potential children
 * @param parentId - The parent ID for the current level (null for top-level)
 * @returns Flat array of navigation items with parentId set
 */
export function flattenNavigationForInsert(
  items: NavItem[],
  parentId: number | null = null
): Omit<NavInsert, 'id'>[] {
  const result: Omit<NavInsert, 'id'>[] = [];

  for (const item of items) {
    const { children, id, ...rest } = item; // Remove children and id

    // Add the current item
    result.push({
      ...rest,
      parentId,
    });

    // If there are children, recursively flatten them
    // Note: We can't know the actual DB id yet, so this approach has limitations
    if (children && children.length > 0) {
      // This will need the actual inserted ID - see insertNavigationHierarchy below
      result.push(...flattenNavigationForInsert(children, id ?? null));
    }
  }

  return result;
}

/**
 * Inserts navigation items hierarchically, handling parent-child relationships.
 * This function inserts items level by level to ensure parent IDs exist.
 * 
 * @param db - Drizzle database instance
 * @param items - Hierarchical navigation items
 * @param parentId - Parent ID for current level
 */
export async function insertNavigationHierarchy(
  db: any, // Drizzle db instance
  items: NavItem[],
  parentId: number | null = null
): Promise<void> {
  for (const item of items) {
    const { children, id, ...rest } = item;

    // Insert the current item
    const [inserted] = await db
      .insert(navigation)
      .values({
        ...rest,
        parentId,
      })
      .returning();

    // If there are children, insert them recursively with the new parent ID
    if (children && children.length > 0) {
      await insertNavigationHierarchy(db, children, inserted.id);
    }
  }
}

/**
 * Builds a hierarchical tree from flat navigation data.
 * Useful for retrieving data from the database and reconstructing the tree.
 * 
 * @param flatItems - Flat array of navigation items from database
 * @returns Hierarchical array with children nested
 */
export function buildNavigationTree(flatItems: NavItem[]): NavItem[] {
  if (!flatItems || !Array.isArray(flatItems)) {
    return [];
  }

  const itemMap = new Map<number, NavItem>();
  const rootItems: NavItem[] = [];

  // First pass: Create a map of all items with empty children arrays
  for (const item of flatItems) {
    // Skip items without valid id
    if (!item || typeof item.id !== 'number') {
      continue;
    }
    itemMap.set(item.id, { ...item, children: [] });
  }

  // Second pass: Build the tree
  for (const item of flatItems) {
    // Skip items without valid id
    if (!item || typeof item.id !== 'number') {
      continue;
    }

    const node = itemMap.get(item.id);
    if (!node) continue;

    // Check if item has parentId in the data (you'll need to include it in query)
    const parentId = (item as any).parentId;
    
    if (parentId === null || parentId === undefined) {
      // Top-level item
      rootItems.push(node);
    } else {
      // Child item - add to parent's children
      const parent = itemMap.get(parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    }
  }

  return rootItems;
}
