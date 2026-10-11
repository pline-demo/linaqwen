import {
  pgTable, serial, varchar, text, integer, boolean, timestamp, pgEnum, jsonb, uniqueIndex, index
} from "drizzle-orm/pg-core";

// ─── ENUMS ───
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const contentStatusEnum = pgEnum("content_status", ["active", "inactive", "draft"]);
export const contactStatusEnum = pgEnum("contact_status", ["new", "read", "replied", "archived"]);

// ─── ROLES ───
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── PERMISSIONS ───
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  group: varchar("group_name", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── ROLE_PERMISSIONS ───
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("role_perm_unique").on(table.roleId, table.permissionId),
]);

// ─── USERS ───
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  status: userStatusEnum("status").default("active"),
  isSuperAdmin: boolean("is_super_admin").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── USER_ROLES ───
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("user_role_unique").on(table.userId, table.roleId),
]);

// ─── SETTINGS ───
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  group: varchar("group_name", { length: 50 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── STORE ───
export const store = pgTable("store", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).default("PERLINA"),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  email: varchar("email", { length: 200 }),
  workingHours: text("working_hours"),
  mapLat: varchar("map_lat", { length: 30 }),
  mapLng: varchar("map_lng", { length: 30 }),
  mapZoom: integer("map_zoom").default(15),
  mapEmbedUrl: text("map_embed_url"),
  heroImage: text("hero_image"),
  exteriorImage: text("exterior_image"),
  interiorImage: text("interior_image"),
  galleryImages: jsonb("gallery_images").$type<string[]>(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── COLLECTIONS ───
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  coverImage: text("cover_image"),
  heroImage: text("hero_image"),
  status: contentStatusEnum("status").default("active"),
  sortOrder: integer("sort_order").default(0),
  featured: boolean("featured").default(false),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── SUBCOLLECTIONS ───
export const subcollections = pgTable("subcollections", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
  status: contentStatusEnum("status").default("active"),
  featured: boolean("featured").default(false),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("subcol_slug_col").on(table.collectionId, table.slug),
]);

// ─── PRODUCTS ───
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  collectionId: integer("collection_id").references(() => collections.id, { onDelete: "set null" }),
  subcollectionId: integer("subcollection_id").references(() => subcollections.id, { onDelete: "set null" }),
  mainImage: text("main_image"),
  status: contentStatusEnum("status").default("active"),
  featured: boolean("featured").default(false),
  sortOrder: integer("sort_order").default(0),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("product_collection_idx").on(table.collectionId),
]);

// ─── PRODUCT_IMAGES ───
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  altText: varchar("alt_text", { length: 300 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── APPLICATIONS (Uygulamalar) ───
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  mainImage: text("main_image"),
  status: contentStatusEnum("status").default("active"),
  sortOrder: integer("sort_order").default(0),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── APPLICATION_IMAGES ───
export const applicationImages = pgTable("application_images", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  altText: varchar("alt_text", { length: 300 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── MEDIA ───
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 300 }).notNull(),
  originalName: varchar("original_name", { length: 300 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  altText: varchar("alt_text", { length: 300 }),
  path: text("path").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── PAGES ───
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content"),
  status: contentStatusEnum("status").default("active"),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── HOMEPAGE_SECTIONS ───
export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionKey: varchar("section_key", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 300 }),
  subtitle: text("subtitle"),
  description: text("description"),
  ctaText: varchar("cta_text", { length: 200 }),
  ctaUrl: varchar("cta_url", { length: 500 }),
  ctaText2: varchar("cta_text_2", { length: 200 }),
  ctaUrl2: varchar("cta_url_2", { length: 500 }),
  imageDesktop: text("image_desktop"),
  imageMobile: text("image_mobile"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  extraData: jsonb("extra_data"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── MENUS ───
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── MENU_ITEMS ───
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull().references(() => menus.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 200 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  target: varchar("target", { length: 20 }).default("_self"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── SEO ───
export const seo = pgTable("seo", {
  id: serial("id").primaryKey(),
  pagePath: varchar("page_path", { length: 500 }).notNull().unique(),
  seoTitle: varchar("seo_title", { length: 200 }),
  metaDescription: text("meta_description"),
  ogTitle: varchar("og_title", { length: 200 }),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonical: varchar("canonical", { length: 500 }),
  robots: varchar("robots", { length: 100 }).default("index, follow"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── CONTACT_REQUESTS ───
export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 200 }),
  subject: varchar("subject", { length: 300 }),
  message: text("message"),
  relatedProduct: varchar("related_product", { length: 300 }),
  relatedCollection: varchar("related_collection", { length: 300 }),
  status: contactStatusEnum("status").default("new"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── AUDIT_LOGS ───
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description"),
  subjectType: varchar("subject_type", { length: 100 }),
  subjectId: integer("subject_id"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("audit_user_idx").on(table.userId),
  index("audit_created_idx").on(table.createdAt),
]);

// ─── LOGIN_LOGS ───
export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  username: varchar("username", { length: 100 }),
  action: varchar("action", { length: 50 }).notNull(), // login, logout, failed
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── FAILED_LOGINS ───
export const failedLogins = pgTable("failed_logins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── BACKUPS ───
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 300 }).notNull(),
  fileSize: integer("file_size"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
