module.exports = {
    type: 'sqlite',
    database: 'database.sqlite',
    synchronize: true,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    cli: {
      migrationsDir: 'src/migrations',
    },
};