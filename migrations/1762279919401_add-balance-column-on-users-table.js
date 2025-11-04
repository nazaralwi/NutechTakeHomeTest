exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('users', {
    balance: {
      type: 'INT',
      notNull: true,
      default: 0,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'balance');
};
