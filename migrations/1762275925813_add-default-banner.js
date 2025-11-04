exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO banner (id, banner_name, banner_image, description)
    VALUES
      ('banner-1', 'Banner 1', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
      ('banner-2', 'Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
      ('banner-3', 'Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
      ('banner-4', 'Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
      ('banner-5', 'Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'),
      ('banner-6', 'Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet')
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM banner WHERE id IN ('banner-1', 'banner-2', 'banner-3', 'banner-4', 'banner-5', 'banner-6')
  `);
};
