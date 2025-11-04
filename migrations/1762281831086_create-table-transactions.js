exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('transactions', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    invoice_number: {
      type: 'TEXT',
      notNull: true,
    },
    transaction_type: {
      type: 'TEXT',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    total_amount: {
      type: 'INT',
      notNull: true,
    },
    created_on: {
      type: 'TEXT',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('transactions');
};
