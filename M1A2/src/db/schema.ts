import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const todoStatus = ['pending', 'in_progress', 'completed'] as const;
export type TodoStatus = typeof todoStatus[number];

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: todoStatus }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
})); 