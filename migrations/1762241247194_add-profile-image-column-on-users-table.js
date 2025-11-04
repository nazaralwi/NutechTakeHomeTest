exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('users', {
    profile_image: {
      type: 'TEXT',
      notNull: false,
    }
  })
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'profile_image');
};
