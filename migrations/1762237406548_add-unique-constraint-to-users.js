exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('users', 'unique_email', {
    unique: ['email'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'unique_email');
};
