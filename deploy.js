const Deployer = require('cra-deployer').default;

const deploy = () => {
  const deployer = new Deployer({
    s3Bucket: 'sirp-shoppin-list',
    cloudfrontDistribution: 'E789O8JIT7VHN',
  });

  deployer.start();
};

deploy();
