exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('services', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    service_code: {
      type: 'TEXT',
      notNull: true,
    },
    service_name: {
      type: 'TEXT',
      notNull: true,
    },
    service_icon: {
      type: 'TEXT',
      notNull: true,
    },
    service_tariff: {
      type: 'INT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('services');
};
