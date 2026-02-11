const up = async ({queryInterface, transaction}) => {
    const statements = [
        `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(255) NOT NULL DEFAULT 'USER',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS baskets (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS brands (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            price INTEGER NOT NULL,
            rating INTEGER NOT NULL DEFAULT 0,
            image VARCHAR(255) NOT NULL,
            category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
            brand_id INTEGER REFERENCES brands(id) ON DELETE RESTRICT ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS basket_products (
            basket_id INTEGER NOT NULL REFERENCES baskets(id) ON DELETE CASCADE ON UPDATE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (basket_id, product_id)
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS ratings (
            rate INTEGER NOT NULL,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (product_id, user_id)
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS product_props (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            value VARCHAR(255) NOT NULL,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            status INTEGER NOT NULL DEFAULT 0,
            comment VARCHAR(255),
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS site_contents (
            id SERIAL PRIMARY KEY,
            key VARCHAR(255) NOT NULL UNIQUE,
            value JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS feedbacks (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255),
            subject VARCHAR(255),
            message TEXT NOT NULL,
            status VARCHAR(255) NOT NULL DEFAULT 'new',
            is_spam BOOLEAN NOT NULL DEFAULT false,
            is_blocked BOOLEAN NOT NULL DEFAULT false,
            source_ip VARCHAR(255),
            user_agent VARCHAR(255),
            read_at TIMESTAMPTZ,
            spam_at TIMESTAMPTZ,
            blocked_at TIMESTAMPTZ,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS feedback_blocks (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255),
            ip VARCHAR(255),
            reason VARCHAR(255) NOT NULL DEFAULT 'spam',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
            provider VARCHAR(64) NOT NULL DEFAULT 'mock',
            amount INTEGER NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'KZT',
            status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
            provider_payment_id VARCHAR(191),
            idempotency_key VARCHAR(191) NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            paid_at TIMESTAMPTZ,
            failed_at TIMESTAMPTZ,
            canceled_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS payment_events (
            id SERIAL PRIMARY KEY,
            payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL ON UPDATE CASCADE,
            provider VARCHAR(64) NOT NULL,
            provider_event_id VARCHAR(191) NOT NULL,
            event_type VARCHAR(128) NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        `,
        `CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);`,
        `CREATE INDEX IF NOT EXISTS products_brand_id_idx ON products (brand_id);`,
        `CREATE INDEX IF NOT EXISTS product_props_product_id_idx ON product_props (product_id);`,
        `CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);`,
        `CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);`,
        `CREATE INDEX IF NOT EXISTS feedbacks_status_idx ON feedbacks (status);`,
        `CREATE UNIQUE INDEX IF NOT EXISTS feedback_blocks_email_unique ON feedback_blocks (email) WHERE email IS NOT NULL;`,
        `CREATE UNIQUE INDEX IF NOT EXISTS feedback_blocks_ip_unique ON feedback_blocks (ip) WHERE ip IS NOT NULL;`,
        `CREATE UNIQUE INDEX IF NOT EXISTS payments_order_id_unique ON payments (order_id);`,
        `CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_payment_id_unique ON payments (provider_payment_id) WHERE provider_payment_id IS NOT NULL;`,
        `CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_idempotency_unique ON payments (provider, idempotency_key);`,
        `CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);`,
        `CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments (order_id);`,
        `CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_event_unique ON payment_events (provider, provider_event_id);`,
        `CREATE INDEX IF NOT EXISTS payment_events_payment_id_idx ON payment_events (payment_id);`,
    ]

    for (const statement of statements) {
        await queryInterface.sequelize.query(statement, {transaction})
    }
}

export {
    up,
}
