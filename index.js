const Minio = require('minio');

module.exports = {
  init: ({
           endPoint,
           bucket,
           port,
           accessKey,
           secretKey,
           useSSL,
           folder,
           host,
           ..._options
         }) => {

    const MINIO = new Minio.Client({
      port: parseInt(port, 10),
      useSSL: useSSL === "true",
      endPoint: host,
      accessKey,
      secretKey,
    });

    return {
      upload: file => {
        return new Promise((resolve, reject) => {
          const pathChunk = file.path ? `${file.path}/` : '';
          const path = `${folder}/${pathChunk}`;

          MINIO.putObject(
            bucket,
            `${path}${file.hash}${file.ext}`,
            Buffer.from(file.buffer, 'binary'),
            {
              'Content-Type': file.mime,
            },
            (err, _etag) => {
              if (err) {
                return reject(err);
              }
              const filePath = `${bucket}/${path}${file.hash}${file.ext}`;
              file.url = `${endPoint}/${filePath}`;
              resolve();
            }
          );
        });
      },

      delete: file => {
        return new Promise((resolve, reject) => {
          const pathChunk = file.path ? `${file.path}/` : '';
          const path = `${folder}/${pathChunk}`;

          MINIO.removeObject(bucket, `${path}${file.hash}${file.ext}`, err => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },
    };
  },
};
