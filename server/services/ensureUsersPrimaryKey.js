const ensureUsersPrimaryKey = async (sequelize) => {
    const sql = `
        DO $$
        BEGIN
            IF to_regclass('public.users') IS NULL THEN
                RETURN;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                  AND column_name = 'id'
            ) THEN
                RETURN;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conrelid = 'public.users'::regclass
                  AND contype = 'p'
            ) THEN
                RETURN;
            END IF;

            ALTER TABLE public.users
            ADD CONSTRAINT users_pkey PRIMARY KEY (id);
        END $$;
    `

    await sequelize.query(sql)
}

export default ensureUsersPrimaryKey
