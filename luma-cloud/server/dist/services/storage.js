import AWS from 'aws-sdk';
import { config } from '../config.js';
const s3 = new AWS.S3({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    s3ForcePathStyle: config.s3.forcePathStyle,
    signatureVersion: 'v4',
});
const BUCKET = config.s3.bucket;
export async function list(prefix) {
    const resp = await s3
        .listObjectsV2({ Bucket: BUCKET, Prefix: prefix.replace(/^\/+/, ''), Delimiter: '/' })
        .promise();
    const files = (resp.Contents || []).map((o) => ({
        key: o.Key,
        size: o.Size || 0,
        lastModified: o.LastModified?.toISOString() || '',
    }));
    const dirs = (resp.CommonPrefixes || []).map((p) => ({ prefix: p.Prefix }));
    return { files, dirs };
}
export async function putObject(key, body, contentType) {
    await s3
        .putObject({
        Bucket: BUCKET,
        Key: key.replace(/^\/+/, ''),
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
    })
        .promise();
}
export function getSignedUrl(key, expiresSec = 3600) {
    return s3.getSignedUrl('getObject', {
        Bucket: BUCKET,
        Key: key.replace(/^\/+/, ''),
        Expires: expiresSec,
    });
}
export async function getObject(key) {
    const resp = await s3
        .getObject({ Bucket: BUCKET, Key: key.replace(/^\/+/, '') })
        .promise();
    return resp.Body;
}
export async function deleteObject(key) {
    await s3.deleteObject({ Bucket: BUCKET, Key: key.replace(/^\/+/, '') }).promise();
}
