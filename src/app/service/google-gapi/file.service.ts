import { Injectable } from "@angular/core";
import { GeneratorBase } from '../generator-sale.service';

export const MIME_TYPE_FOLDER = "application/vnd.google-apps.folder";
export const MIME_TYPE_FILE = "application/vnd.google-apps.file";

@Injectable({
    providedIn: "root"
})
export class FileService {
    controller = new AbortController();
    signal = this.controller.signal;

    constructor() {
        this.signal.addEventListener("abort", () => alert("abort"));
        // this.controller.abort();
        // alert(this.signal.aborted)


    }

    list(q = "") {

        // return new Promise<gapi.client.Response<gapi.client.drive.FileList>>((resove, reject) => {

        return gapi.client.drive.files.list({
            pageSize: 1000,
            fields: "nextPageToken, files(id, name, iconLink, size, mimeType, parents, modifiedTime, createdTime)",
            q: q,
            spaces: "drive",
            orderBy: 'createdTime desc'
        })
        //.then(resove, reject);
        // })
    }
    file(id, alt = ""): Promise<gapi.client.Response<gapi.client.drive.File>> {

        return new Promise((resolve, reject) => {
            // console.log(`[GAPI] Get File ${alt === 'media' ? 'media' : 'info'}`);

            gapi.client.drive.files.get({
                fileId: id,
                alt,
                fields: "id, name, iconLink, size, mimeType, parents, modifiedTime, createdTime"
            })
                //.execute((response)=> resolve(response))
                .then(resolve, reject);
        })
    }
    delete(id: string): Promise<gapi.client.Response<void>> {
        return new Promise((resolve, reject) => {
            gapi.client.drive.files.delete({
                fileId: id
            }).then(resolve, reject);
        })
    }
    createFolder(resource: { name: string, mimeType: string, parents?: string[] } = { name: "New Folder", mimeType: MIME_TYPE_FOLDER, parents: [] }) {
        return new Promise((resolve, reject) => {
            gapi.client.drive.files.create({ resource }).then(resolve, reject)
        })
    }


    createFile(name, data = {}) {

        const boundary = "-------314159265358979323846";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const contentType = "application/json";
        var metadata = {
            name: name,
            mimeType: contentType
        };

        // let base = this.generatorBase.genereteSale(new Date(2020, 0, 1));
        var multipartRequestBody =
            delimiter +
            "Content-Type: application/json \r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json \r\n\r\n" +
            JSON.stringify(data, null, 2) +
            close_delim;

        return new Promise((resolve, reject) => {
            gapi.client.request({
                path: "/upload/drive/v3/files",
                method: "POST",
                params: { uploadType: "multipart" },
                headers: {
                    "Content-Type": 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            }).then(resolve, reject);

        })
    }

    updateFile({ id, name = "new file", data = {} }) {
        const boundary = "-------314159265358979323846";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const contentType = "application/json";

        var metadata = {
            name: name,
            mimeType: contentType
        };

        var multipartRequestBody =
            delimiter +
            "Content-Type: application/json \r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json \r\n\r\n" +
            JSON.stringify(data, null, 2) +
            close_delim;

        return new Promise((resolve, reject) => {
            gapi.client.request({
                path: "/upload/drive/v3/files/" + id,
                method: "PATCH",
                params: { uploadType: "multipart", alt: "json" },
                headers: {
                    "Content-Type": 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            }).then(resolve, reject);
        })
    }
}