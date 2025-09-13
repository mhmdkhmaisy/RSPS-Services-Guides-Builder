import { guides, tags, guideTags, type Guide, type InsertGuide, type Tag, type InsertTag, type GuideWithTags } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Guide methods
  getGuides(): Promise<GuideWithTags[]>;
  getGuide(id: string): Promise<GuideWithTags | undefined>;
  getGuideBySlug(slug: string): Promise<GuideWithTags | undefined>;
  createGuide(guide: InsertGuide, tagIds?: string[]): Promise<GuideWithTags>;
  updateGuide(id: string, guide: Partial<InsertGuide>, tagIds?: string[]): Promise<GuideWithTags>;
  deleteGuide(id: string): Promise<void>;
  searchGuides(query: string): Promise<GuideWithTags[]>;
  getGuidesByTag(tagId: string): Promise<GuideWithTags[]>;

  // Tag methods
  getTags(): Promise<Tag[]>;
  getTag(id: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Guide methods
  async getGuides(): Promise<GuideWithTags[]> {
    const result = await db
      .select()
      .from(guides)
      .leftJoin(guideTags, eq(guides.id, guideTags.guideId))
      .leftJoin(tags, eq(guideTags.tagId, tags.id))
      .orderBy(desc(guides.createdAt));

    const guideMap = new Map<string, GuideWithTags>();
    
    for (const row of result) {
      const guide = row.guides;
      const tag = row.tags;
      
      if (!guideMap.has(guide.id)) {
        guideMap.set(guide.id, { ...guide, tags: [] });
      }
      
      if (tag) {
        guideMap.get(guide.id)!.tags.push(tag);
      }
    }

    return Array.from(guideMap.values());
  }

  async getGuide(id: string): Promise<GuideWithTags | undefined> {
    const result = await db
      .select()
      .from(guides)
      .leftJoin(guideTags, eq(guides.id, guideTags.guideId))
      .leftJoin(tags, eq(guideTags.tagId, tags.id))
      .where(eq(guides.id, id));

    if (result.length === 0) return undefined;

    const guide = result[0].guides;
    const guideTags = result
      .filter((row: any) => row.tags !== null)
      .map((row: any) => row.tags!);

    return { ...guide, tags: guideTags };
  }

  async getGuideBySlug(slug: string): Promise<GuideWithTags | undefined> {
    const result = await db
      .select()
      .from(guides)
      .leftJoin(guideTags, eq(guides.id, guideTags.guideId))
      .leftJoin(tags, eq(guideTags.tagId, tags.id))
      .where(eq(guides.slug, slug));

    if (result.length === 0) return undefined;

    const guide = result[0].guides;
    const guideTags = result
      .filter((row: any) => row.tags !== null)
      .map((row: any) => row.tags!);

    return { ...guide, tags: guideTags };
  }

  async createGuide(guide: InsertGuide, tagIds: string[] = []): Promise<GuideWithTags> {
    const id = randomUUID();
    const [newGuide] = await db
      .insert(guides)
      .values({ ...guide, id })
      .returning();

    if (tagIds.length > 0) {
      await db.insert(guideTags).values(
        tagIds.map(tagId => ({ guideId: id, tagId }))
      );
    }

    return this.getGuide(id) as Promise<GuideWithTags>;
  }

  async updateGuide(id: string, guide: Partial<InsertGuide>, tagIds?: string[]): Promise<GuideWithTags> {
    await db
      .update(guides)
      .set({ ...guide, updatedAt: new Date() })
      .where(eq(guides.id, id));

    if (tagIds !== undefined) {
      await db.delete(guideTags).where(eq(guideTags.guideId, id));
      if (tagIds.length > 0) {
        await db.insert(guideTags).values(
          tagIds.map(tagId => ({ guideId: id, tagId }))
        );
      }
    }

    return this.getGuide(id) as Promise<GuideWithTags>;
  }

  async deleteGuide(id: string): Promise<void> {
    await db.delete(guides).where(eq(guides.id, id));
  }

  async searchGuides(query: string): Promise<GuideWithTags[]> {
    const result = await db
      .select()
      .from(guides)
      .leftJoin(guideTags, eq(guides.id, guideTags.guideId))
      .leftJoin(tags, eq(guideTags.tagId, tags.id))
      .where(
        and(
          ilike(guides.title, `%${query}%`)
        )
      )
      .orderBy(desc(guides.createdAt));

    const guideMap = new Map<string, GuideWithTags>();
    
    for (const row of result) {
      const guide = row.guides;
      const tag = row.tags;
      
      if (!guideMap.has(guide.id)) {
        guideMap.set(guide.id, { ...guide, tags: [] });
      }
      
      if (tag) {
        guideMap.get(guide.id)!.tags.push(tag);
      }
    }

    return Array.from(guideMap.values());
  }

  async getGuidesByTag(tagId: string): Promise<GuideWithTags[]> {
    const result = await db
      .select()
      .from(guides)
      .innerJoin(guideTags, eq(guides.id, guideTags.guideId))
      .leftJoin(tags, eq(guideTags.tagId, tags.id))
      .where(eq(guideTags.tagId, tagId))
      .orderBy(desc(guides.createdAt));

    const guideMap = new Map<string, GuideWithTags>();
    
    for (const row of result) {
      const guide = row.guides;
      const tag = row.tags;
      
      if (!guideMap.has(guide.id)) {
        guideMap.set(guide.id, { ...guide, tags: [] });
      }
      
      if (tag) {
        guideMap.get(guide.id)!.tags.push(tag);
      }
    }

    return Array.from(guideMap.values());
  }

  // Tag methods
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const id = randomUUID();
    const [newTag] = await db
      .insert(tags)
      .values({ ...tag, id })
      .returning();
    return newTag;
  }

  async updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag> {
    const [updatedTag] = await db
      .update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }
}

export const storage = new DatabaseStorage();
