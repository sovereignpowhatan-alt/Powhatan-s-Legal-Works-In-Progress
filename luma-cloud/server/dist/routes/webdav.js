import { v2 as webdav } from 'webdav-server';
import { Router } from 'express';
// Simple virtual file system translating to S3 keys
class S3FS extends webdav.FileSystem {
    _fastExistCheck(_ctx, _path, _callback) {
        _callback(null, true);
    }
}
const server = new webdav.WebDAVServer({
    requireAuthentification: false,
});
// Mount a minimal root FS; in production implement full read/write FS methods
server.setFileSystem('/', new S3FS(), (success) => {
    if (!success)
        console.error('Failed to mount S3FS');
});
export const webdavApp = Router();
webdavApp.use((req, res) => {
    server.express(req, res);
});
