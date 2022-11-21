const Deployer = require('cra-deployer').default;

const deploy = () => {
  const deployer = new Deployer({
    s3Bucket: 'sirp-shoppin-list',
    cloudfrontDistribution: 'E789O8JIT7VHN',
    uploadAnyway: true,
    uploadFiles: [
      'index.html',
      'asset-manifest.json',
      'manifest.json',
      'robots.txt',
      'favicon.ico',
    ],
  });

  deployer.start();
};

deploy();
