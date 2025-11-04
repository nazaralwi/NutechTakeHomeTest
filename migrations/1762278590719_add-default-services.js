exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO services (id, service_code, service_name, service_icon, service_tariff)
    VALUES
      ('service-1', 'PAJAK', 'Pajak PBB', 'https://nutech-integrasi.app/dummy.jpg', 40000),
      ('service-2', 'PLN', 'Listrik', 'https://nutech-integrasi.app/dummy.jpg', 10000),
      ('service-3', 'PDAM', 'PDAM Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 40000),
      ('service-4', 'PULSA', 'Pulsa', 'https://nutech-integrasi.app/dummy.jpg', 40000),
      ('service-5', 'PGN', 'PGN Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000),
      ('service-6', 'MUSIK', 'Musik Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000),
      ('service-7', 'TV', 'TV Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000),
      ('service-8', 'PAKET_DATA', 'Paket Data', 'https://nutech-integrasi.app/dummy.jpg', 50000),
      ('service-9', 'VOUCHER_GAME', 'Voucher Game', 'https://nutech-integrasi.app/dummy.jpg', 100000),
      ('service-10', 'VOUCHER_MAKANAN', 'Voucher Makanan', 'https://nutech-integrasi.app/dummy.jpg', 100000),
      ('service-11', 'QURBAN', 'Qurban', 'https://nutech-integrasi.app/dummy.jpg', 200000),
      ('service-12', 'ZAKAT', 'Zakat', 'https://nutech-integrasi.app/dummy.jpg', 300000);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM services WHERE id IN (
      'service-1', 'service-2', 'service-3', 'service-4', 'service-5', 'service-6',
      'service-7', 'service-8', 'service-9', 'service-10', 'service-11', 'service-12'
    );
  `);
};
