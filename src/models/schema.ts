import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const eventsTable = sqliteTable('events', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    created_at: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    date: integer({ mode: 'timestamp' }).notNull(),
    name: text('event_name').notNull(),
    description: text('description'),
    status: text('status').notNull(),
    isActive: integer('is_active', { mode: 'boolean' })
        .notNull()
        .default(false),
    startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
    endsAt: integer('ends_at', { mode: 'timestamp' }).notNull(),
    url: text('url'),
    isOnline: integer('is_online', { mode: 'boolean' })
        .notNull()
        .default(false),
    capacity: integer('capacity').notNull().default(0),
    eventImage: text('event_image').notNull(),
    // jsonb[] NO existe en LibSQL. Usa un array serializado o una tabla relacionada.
    aditionalInfo: text({ mode: 'json' }).$type<{ detail: string }>(),
    prices: text({ mode: 'json' }).$type<{ detail: string }>(),
    duration: integer('duration'),
    userId: text('user_id'),
    map: integer('map', { mode: 'boolean' }).notNull().default(false),
    displayMap: integer('display_map', { mode: 'boolean' })
        .notNull()
        .default(false)
})

export const venuesTable = sqliteTable('venues', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    venueName: text('venue_name').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    country: text('country').notNull(),
    postalCode: text('postal_code').notNull(),
    latitude: integer('latitude', { mode: 'number' }).notNull(),
    longitude: integer('longitude', { mode: 'number' }).notNull(),
    svgMap: text('svg_map'), // SVG map as text
    eventId: integer('event_id')
        .notNull()
        .references(() => eventsTable.id, { onDelete: 'cascade' })
        .default(1),
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
})

export const sectionsTable = sqliteTable('sections', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    sectionName: text('section_name').notNull(),
    price: integer('price').notNull().default(0),
    description: text('description'),
    capacity: integer('capacity').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' })
        .notNull()
        .default(false),
    color: text('color').notNull(),
    venueId: integer('venue_id')
        .notNull()
        .references(() => venuesTable.id), // uuid → text
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
})

export const seatsTable = sqliteTable('seats', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    sectionId: integer('section_id')
        .notNull()
        .references(() => sectionsTable.id),
    row: text('row').notNull(),
    number: integer('number').notNull(),
    isAvailable: integer('is_available', { mode: 'boolean' })
        .notNull()
        .default(true),
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
})

export const ticketsTable = sqliteTable('tickets', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    eventId: integer('event_id')
        .notNull()
        .references(() => eventsTable.id),
    sectionId: integer('section_id')
        .notNull()
        .references(() => sectionsTable.id),
    seatId: integer('seat_id')
        .notNull()
        .references(() => seatsTable.id),
    userId: text('user_id').notNull(),
    orderId: integer('order_id')
        .notNull()
        .references(() => ordersTable.id),
    isUsed: integer('is_valid', { mode: 'boolean' }).notNull().default(false),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
})

export const ordersTable = sqliteTable('orders', {
    id: integer({ mode: 'number' })
        .notNull()
        .primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    eventId: integer('event_id')
        .notNull()
        .references(() => eventsTable.id),
    totalAmount: integer('total_amount').notNull().default(0),
    status: text('status').notNull().default('pending'),
    paymentMethod: text('payment_method').notNull(),
    paymentStatus: text('payment_status').notNull().default('pending'),
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
})

export const payments = sqliteTable('payments', {
    id: text('id').primaryKey(), // id interno (UUID)
    onvoPaymentId: text('onvo_payment_id'), // id del pago en Onvo
    status: text('status').notNull(), // created | processing | succeeded | failed | refunded
    amount: integer('amount').notNull(), // en centavos
    currency: text('currency').notNull(),
    description: text('description'),
    pmId: text('pm_id'), // payment_method_id tokenizado
    customerEmail: text('customer_email'),
    idempotencyKey: text('idempotency_key').unique(),
    createdAt: integer('created_at')
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: integer('updated_at')
        .default(sql`(strftime('%s','now'))`)
        .notNull()
})

export const webhookEvents = sqliteTable('webhook_events', {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    raw: text('raw').notNull(),
    receivedAt: integer('received_at')
        .default(sql`(strftime('%s','now'))`)
        .notNull()
})

export const EventsRelations = relations(eventsTable, ({ one }) => ({
    venues: one(venuesTable)
}))

export const venuesRelations = relations(venuesTable, ({ one, many }) => ({
    events: one(eventsTable, {
        fields: [venuesTable.eventId],
        references: [eventsTable.id]
    }),
    sections: many(sectionsTable)
}))

export const sectionsRelations = relations(sectionsTable, ({ one }) => ({
    venues: one(venuesTable, {
        fields: [sectionsTable.venueId],
        references: [venuesTable.id]
    })
}))

export const SchemaDb = {
    eventsTable,
    venuesTable,
    sectionsTable,
    seatsTable,
    ticketsTable,
    ordersTable
}

export type Schema = {
    InsertEventsTable: typeof eventsTable.$inferInsert
    SelectEventsTable: typeof eventsTable.$inferSelect
    InsertVenuesTable: typeof venuesTable.$inferInsert
    SelectVenuesTable: typeof venuesTable.$inferSelect
    InsertSectionsTable: typeof sectionsTable.$inferInsert
    SelectSectionsTable: typeof sectionsTable.$inferSelect
    InsertSeatsTable: typeof seatsTable.$inferInsert
    SelectSeatsTable: typeof seatsTable.$inferSelect
    InsertTicketsTable: typeof ticketsTable.$inferInsert
    SelectTicketsTable: typeof ticketsTable.$inferSelect
    InsertOrdersTable: typeof ordersTable.$inferInsert
    SelectOrdersTable: typeof ordersTable.$inferSelect
}
