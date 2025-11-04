exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('banner', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    banner_name: {
      type: 'TEXT',
      notNull: true,
    },
    banner_image: {
      type: 'TEXT',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('banner');
};
