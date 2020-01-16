const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION
});
const pinpoint = new AWS.Pinpoint();
const importFiles = ['split0.csv', 'split1.csv', 'split2.csv', 'split3.csv', 'split4.csv', 'split5.csv', 'split6.csv', 'split7.csv'];
//const importFiles = ['70k.csv'];
//const importFiles = ['test'];

const s3Bucket = 's3://parrallel-import-pinpoint';

const import_chunk = function(filename) {
    
    return new Promise((resolve, reject) => {
       
       console.log('Start Import of: ' + filename);
       
       const params = {
        ApplicationId: process.env.APPLICATION_ID,
        ImportJobRequest: {
          Format: "CSV",
          RoleArn: process.env.IMPORT_ROLE_ARN,
          DefineSegment: true,
          S3Url: `${s3Bucket}/${filename}`,
          SegmentName: filename
        }
      };
      
      // Kickoff import job
      pinpoint.createImportJob(params, (err, data) => {
          
          // set up an interval to poll on the status of the import, resolve promise when successful
          const pollParams = {
              ApplicationId: process.env.APPLICATION_ID,
              JobId: data.ImportJobResponse.Id
          };
          
          setInterval(() => {
              
              pinpoint.getImportJob(pollParams, (pollErr, pollData) => {
                  if (err) { reject(pollErr); }
                  else if (pollData.ImportJobResponse.JobStatus === 'COMPLETED') {
                      console.log('Finish Import of: ' + pollData.ImportJobResponse.Definition.S3Url);
                      resolve();
                  }
                  console.log('Waiting for Import of: ' + pollData.ImportJobResponse.Definition.S3Url);
              });
              
          }, 1000);
          
      });
    });
};



exports.handler = async (event) => {
    
    const promises = [];
    
    importFiles.forEach((file) => {
        promises.push(import_chunk(file));
    });
    
    return Promise.all(promises)
        .then((results) => {
            return "Done";
        });
    
    
};

