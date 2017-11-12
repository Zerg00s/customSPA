(function () {
    'use strict';

    angular.module('sp.service', []);
    angular.module('sp.service').factory('sp', sp);

    sp.$inject = ['$q', '$http', '$log'];
    function sp($q, $http, $log) {
        var sp = {};
        sp.formDigest = null; 

        var urls = {};
        urls.list = function (listTitle) {
            return urls.lists + "/getbytitle('" + listTitle + "')";
        }

        if (typeof _spPageContextInfo == "undefined") {
            window._spPageContextInfo = {};
            window._spPageContextInfo.webServerRelativeUrl = "";
            window._spPageContextInfo.webAbsoluteUrl = "";
        }
        urls.lists = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists";

        urls.listItems = function (listTitle) {
            return urls.list(listTitle) + "/items";
        }

        urls.listFields = function (listTitle) {
            return urls.list(listTitle) + "/fields";
        }

        urls.getItem = function (listTitle, itemId) {
            return urls.list(listTitle) + "/getItemById('" + itemId + "')"
        }

        function Request(method) {
            this.method = method.toUpperCase();

            this.settings = {
                method: this.method,
                headers: angular.extend({}, headers.default)
            }

            if (this.method === "POST") {
                this.settings.headers["Accept"] = "application/json;odata=verbose";
                this.settings.headers["Content-Type"] = 'application/json;odata=verbose';
            }

            this.Json = function () {
                this.settings.dataType = "JSON"
                return this;
            }

            this.digest = function (digest) {
                this.settings.headers["X-RequestDigest"] = digest;
                return this;
            }

            this.patch = function (item) {
                this.settings.headers["X-Http-Method"] = "PATCH";
                this.settings.headers["If-Match"] = item.__metadata.etag;
                return this;
            }

            this.delete = function (item) {
                this.settings.headers["X-Http-Method"] = "DELETE";
                this.settings.headers["If-Match"] = "*";
                return this;
            }

            this.list = function (listTitle) {
                this.settings["url"] = urls.list(listTitle);
                return this;
            }

            this.listItems = function (listTitle) {
                this.settings["url"] = urls.listItems(listTitle);
                return this;
            }

            this.listFields = function (listTitle) {
                this.settings["url"] = urls.listFields(listTitle);
                return this;
            }

            this.getItem = function (listTitle, itemId) {
                this.settings["url"] = urls.getItem(listTitle, itemId);
                return this;
            }

            this.data = function (data) {
                this.settings["data"] = data;
                return this;
            }

            this.url = function (url) {
                this.settings["url"] = url;
                return this;
            }
        }

        Request.post = function (url) {
            return new Request("POST").url(url);
        }

        Request.get = function (url) {
            return new Request("GET").url(url);
        }

        var headers = {};
        headers.default = { "Accept": "application/json; odata=verbose" };
        headers.digest = function (digest) {
            return {
                "Content-Type": 'application/json;odata=verbose',
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": digest
            };
        }

        /* Digest typically expires after 30 mins. we need to get a new one */
        /* I purge digest after 20 min, just in case: */
        function purgeStaleDigest(digest) {
            if (!digest) {
                return null;
            }
            var digestissued = digest.split(',')[1];
            var digestissuedDate = new Date(digestissued);
            var timeDifference = (new Date() - digestissuedDate);
            var diffMins = Math.round(((timeDifference % 86400000) % 3600000) / 60000); //difference in  minutes
            if (diffMins > 20) {
                $log.warn('Digest has expired after 20 min. Getting a new one...')
                return null;
            } 
            return digest;
        }
        /**Get Form digest  */
        sp.getFormDigest = function () {
            sp.formDigest = purgeStaleDigest(sp.formDigest);
            // if (sp.formDigest) {
            //     return $q.resolve(sp.formDigest);
            // }
            // else {
                $log.debug('getting new digest!');
                var settings = Request.post(_spPageContextInfo.webServerRelativeUrl + "/_api/contextinfo").settings;
                return $http(settings).then(function (response) {
                    sp.formDigest = response.data.d.GetContextWebInformation.FormDigestValue;
                    return response.data.d.GetContextWebInformation.FormDigestValue;
                });
            // }
        }

        sp.getListEntityFullName = function (listTitle) {
            var url = urls.list(listTitle) + "/listItemEntityTypeFullName";
            var settigs = Request.get(url).settings;

            return $http(settigs).then(function (results) {

                return results.data.d.ListItemEntityTypeFullName;
            });
        }

        /** Check if list if exists */
        sp.listExists = function (listTitle) {
            var url = urls.lists + "?$filter=Title eq '" + listTitle + "'";
            var settings = Request.get(url).settings;
            return $http(settings).then(returnTrueIfNotZero).catch(errorHandler)
        }

        /** Create List
         * 
         * @param digest Formdigest, retrieved using getFormDigest method
         */
        sp.createList = function (digest, listTitle) {
            var data = JSON.stringify({
                '__metadata': { 'type': 'SP.List' },
                'AllowContentTypes': false,
                'BaseTemplate': 100,
                'ContentTypesEnabled': true,
                'Title': listTitle
            });
            var settings = Request.post(urls.lists).data(data).Json().digest(digest).settings;
            return $http(settings).then(returnData).catch(errorHandler);
        }

        /** Ensures that list is created  */
        sp.ensureList = function (listTitle) {
            var listExistsPromise = sp.listExists(listTitle);
            var formDigestPromise = sp.getFormDigest();
            return $q.all([formDigestPromise, listExistsPromise]).then(
                function (values) {
                    return createListConditional(values, listTitle);
                }
            ).catch(errorHandler);
        }

        function createListConditional(values, listTitle) {
            if (values[1] != true) {
                return sp.createList(values[0], listTitle);
            } else {
                var message = 'list already exists';
                $log.debug(message);
                return message
            }
        }

        /** SYSTEM LIST STORAGE. used for storing global key-value pairs */
        sp.createListStorage = function (listTitle) {
            return createList(listTitle);
        }

        sp.ensureListStorage = function (listTitle) {
            return sp.ensureList(listTitle).then(function () {
                return sp.ensureField(listTitle, 'Value');
            });
        }

        sp.addFieldToList = function (digest, listTitle, fieldTitle) {
            var data = JSON.stringify({
                '__metadata': { 'type': 'SP.FieldMultiLineText' },
                'FieldTypeKind': 3,
                'Title': fieldTitle,
                'NumberOfLines': 8
            });

            var url = urls.listFields(listTitle);
            var settings = Request.post(url).Json().digest(digest).data(data).settings;
            return $http(settings).then(returnData).catch(errorHandler);
        }

        sp.fieldExists = function (listTitle, fieldTitle) {
            var data = JSON.stringify({
                '__metadata': { 'type': 'SP.FieldMultiLineText' },
                'FieldTypeKind': 3,
                'Title': fieldTitle,
                'NumberOfLines': 8
            });
            var url = urls.listFields(listTitle) + "?$filter=InternalName eq 'Value'";
            var settings = Request.get(url).settings;
            return $http(settings).then(returnTrueIfExists).catch(errorHandlerFieldExists);
        }

        sp.ensureField = function (listTitle, fieldTitle) {
            return sp.fieldExists(listTitle, fieldTitle).then(function (fieldExists) {
                if (fieldExists) {
                    $log.debug('field exists: ' + fieldTitle);
                }
                else {
                    return sp.getFormDigest().then(function (digest) {
                        $log.debug('field does not exist.. creating it..');
                        return sp.addFieldToList(digest, listTitle, fieldTitle);
                    })
                }
            });
        }

        sp.getStoreItem = function (listTitle, key) {
            var url = urls.listItems(listTitle) + "?$filter=Title eq '" + key + "'";
            var settings = Request.get(url).settings;
            return $http(settings).then(returnListItem).catch(errorHandler)
        }

        function returnListItemValues(response) {
            if (response.data.d.results.length > 0) {
                return parseJsonValue(response.data.d.results[0]);
            }
            else {
                return response.data.d;
            }
        }

        sp.getKey = function (listTitle, key) {
            var url = urls.listItems(listTitle) + "?$filter=Title eq '" + encodeURIComponent(key) + "'";
            $log.debug(url);
            var settings = Request.get(url).settings;
            return $http(settings).then(returnKey).catch(errorHandler)
        }

        sp.getByTitle = function (listTitle, itemTitle) {
            var url = urls.listItems(listTitle) + "?$filter=Title eq '" + encodeURIComponent(itemTitle) + "'";
            $log.debug(url);
            var settings = Request.get(url).settings;
            return $http(settings).then(returnListItemValues).catch(errorHandler)
        }

        sp.getKeys = function (listTitle) {
            var url = urls.listItems(listTitle);
            var settings = Request.get(url).settings;
            return $http(settings).then(returnKeys).catch(errorHandler);
        }


        function returnListItem(response) {
            if (response.data.d.results.length > 0) {
                return parseJsonValue(response.data.d.results[0]);
            }
            else {
                return response.data.d;
            }
        }

        function returnKey(response) {
            if (response.data.d.results.length > 0) {
                return parseJsonValue(response.data.d.results[0].Value);
            }
            else {
                return null;
            }
        }

        /** graceful Json parsing */
        function parseJsonValue(value) {
            try {
                return angular.fromJson(value);
            }
            catch (err) {
                return value;
            }
        }

        function returnKeys(response) {
            if (response.data.d.results.length > 0) {
                var keys = [];
                for (var i = 0; i < response.data.d.results.length; i++) {
                    keys.push({
                        Key: response.data.d.results[i].Title,
                        Value: parseJsonValue(response.data.d.results[i].value)
                    });
                }
                return keys;
            }
            else {
                return null;
            }
        }

        sp.removeItem = function (listTitle, key, digest, item) {
            var url = urls.getItem(listTitle, item.ID);
            var settings = Request.post(url).digest(digest).delete().settings;
            return $http(settings).then(returnData).catch(errorHandler);
        }

        sp.createItem = function (listTitle, key, value, digest, ListItemEntityTypeFullName) {
            var data = {
                '__metadata': { 'type': ListItemEntityTypeFullName.toString() }
            };
            data['Title'] = key;
            data['Value'] = JSON.stringify(value);

            data = JSON.stringify(data);
            var url = urls.listItems(listTitle);

            var settings = Request.post(url).data(data).digest(digest).settings;
            return $http(settings).then(returnData).catch(errorHandler);
        }

        sp.createListItem = function (listTitle, key, values, digest, ListItemEntityTypeFullName) {
            var data = {
                '__metadata': { 'type': ListItemEntityTypeFullName.toString() }
            };

            data['Title'] = key;

            for (var property in values) {
                data[property] = values[property];
            }

            data = JSON.stringify(data);
            var url = urls.listItems(listTitle);

            var settings = Request.post(url).data(data).digest(digest).settings;
            return $http(settings).then(returnData).catch(errorHandler);
        }



        sp.updateItem = function (listTitle, key, value, digest, ListItemEntityTypeFullName, item) {
            var data = {
                '__metadata': { 'type': ListItemEntityTypeFullName.toString() }
            };
            data['Title'] = key;
            data['Value'] = JSON.stringify(value);

            data = JSON.stringify(data);
            var url = urls.getItem(listTitle, item.ID);
            var settings = Request.post(url).digest(digest).patch(item).data(data).settings;

            return $http(settings).then(returnData).catch(errorHandler);
        }

        sp.updateListItem = function (listTitle, key, values, digest, ListItemEntityTypeFullName, item) {
            var data = {
                '__metadata': { 'type': ListItemEntityTypeFullName.toString() }
            };
            data['Title'] = key;
            for (var property in values) {
                data[property] = values[property];
            }

            data = JSON.stringify(data);
            var url = urls.getItem(listTitle, item.ID);
            var settings = Request.post(url).digest(digest).patch(item).data(data).settings;

            return $http(settings).then(returnData).catch(errorHandler);
        }

        sp.saveKey = function (listTitle, key, value) {
            return sp.getStoreItem(listTitle, key).then(function (items) {

                var formDigestPromise = sp.getFormDigest();
                var listEntityNamePromise = sp.getListEntityFullName(listTitle);
                return $q.all([formDigestPromise, listEntityNamePromise]).then(function (values) {

                    if (items.length > 0) {
                        $log.debug(key + ' key exists: ' + items);
                        return updateItemConditional(values, listTitle, key, value, items[0]);
                    }
                    else {
                        return createItemConditional(values, listTitle, key, value);
                    }
                });

            });
        }

        sp.saveListItem = function (listTitle, itemTitle, values) {
            return sp.getByTitle(listTitle, itemTitle).then(function (item) {
               
                var formDigestPromise = sp.getFormDigest();
                var listEntityNamePromise = sp.getListEntityFullName(listTitle);
                return $q.all([formDigestPromise, listEntityNamePromise]).then(function (digestValues) {
                    if (item.Created) {
                        $log.debug(itemTitle + ' key exists: ');
                        $log.debug(item);
                        return updateListItemConditional(digestValues, listTitle, itemTitle, values, item);
                    }
                    else {
                        $log.debug(itemTitle + ' key DOES NOT EXIST: ');
                        $log.debug(item);
                        return createListItemConditional(digestValues, listTitle, itemTitle, values);
                    }
                });

            });
        }


        sp.removeKey = function (listTitle, key) {
            return sp.getStoreItem(listTitle, key).then(function (items) {
                return sp.getFormDigest().then(function (digest) {
                    if (items.length > 0) {
                        $log.debug('key exists. deleting...  ' + items);
                        return sp.removeItem(listTitle, key, digest, items[0])
                    }
                    else {
                        return "key doesn't exist";
                    }
                });
            });
        }

        function updateItemConditional(values, listTitle, key, value, item) {
            var digest = values[0];
            var ListEntityFullName = values[1];
            return sp.updateItem(listTitle, key, value, digest, ListEntityFullName, item);
        }
        function createItemConditional(values, listTitle, key, value) {
            var digest = values[0];
            var ListEntityFullName = values[1];

            return sp.createItem(listTitle, key, value, digest, ListEntityFullName);
        }

        function updateListItemConditional(digestValues, listTitle, key, values, item) {
            $log.debug(digestValues);
            var digest = digestValues[0];
            var ListEntityFullName = digestValues[1];
            return sp.updateListItem(listTitle, key, values, digest, ListEntityFullName, item);
        }
        function createListItemConditional(digestValues, listTitle, key, values) {
            var digest = digestValues[0];
            var ListEntityFullName = digestValues[1];

            return sp.createListItem(listTitle, key, values, digest, ListEntityFullName);
        }


        /***** SYSTEM LIST STORAGE CLASS******/
        function ListStorage(listTitle) {
            this.listTitle = listTitle;
            var that = this;

            this.ensureStorage = function () {
                return sp.ensureListStorage(this.listTitle);
            }

            this.getByTitle = function (itemTitle) {
                return sp.getByTitle(this.listTitle, itemTitle);
            }

            /** param @values Object that contains InternalField Names and their values */
            this.put = function (itemTitle, values) {
                return sp.saveListItem(this.listTitle, itemTitle, values);
            }

        }

        sp.getListStorage = function (listTitle) {
            return new ListStorage(listTitle);
        }
        /***** SYSTEM LIST CLASS END******/



        /***** SYSTEM STORAGE CLASS******/
        function SystemStorage(listTitle) {
            this.listTitle = listTitle;
            var that = this;

            this.ensureStorage = function () {
                return sp.ensureListStorage(this.listTitle);
            }

            this.put = function (key, value) {
                return sp.saveKey(this.listTitle, key, value);
            }

            this.get = function (key) {
                return sp.getKey(this.listTitle, key);
            }

            this.remove = function (key) {
                return sp.removeKey(this.listTitle, key);
            }

            this.getAll = function () {
                var url = urls.listItems(this.listTitle);
                var settings = Request.get(url).settings;
                return $http(settings).then(returnKeys).catch(errorHandler);
            }
        };

        sp.getSystemStorage = function (listTitle) {
            return new SystemStorage(listTitle);
        }

        /***** USER STORAGE CLASS******/
        function UserStorage(listTitle) {
            this.listTitle = listTitle;
            var that = this;

            this.ensureStorage = function () {
                return sp.ensureListStorage(this.listTitle);
            }

            this.put = function (key, value) {
                return this.get(key).then(function (items) {
                    var formDigestPromise = sp.getFormDigest();
                    var listEntityNamePromise = sp.getListEntityFullName(that.listTitle);
                    return $q.all([formDigestPromise, listEntityNamePromise]).then(function (values) {
                        if (items.length > 0) {
                            $log.debug('key exists: ' + items);
                            return updateItemConditional(values, that.listTitle, key, value, items[0]);
                        }
                        else {
                            return createItemConditional(values, that.listTitle, key, value);
                        }
                    });

                });
            }

            this.get = function (key) {
                var url = urls.listItems(listTitle) + "?$filter=";
                var filter = "((Title eq '" + key + "') and (AuthorId eq " + _spPageContextInfo.userId + "))";
                url = url + encodeURIComponent(filter);
                var settings = Request.get(url).settings;
                return $http(settings).then(returnListItem).catch(errorHandler)
            }

            this.remove = function (key) {
                return this.get(key).then(function (items) {
                    return sp.getFormDigest().then(function (digest) {
                        if (items.length > 0) {
                            $log.debug('key exists. deleting...  ' + items);
                            return sp.removeItem(listTitle, key, digest, items[0])
                        }
                        else {
                            return "key doesn't exist";
                        }
                    });
                });
            }

            this.getAll = function () {
                var url = urls.listItems(this.listTitle) + "?$filter=AuthorId eq " + _spPageContextInfo.userId;
                var settings = Request.get(url).settings;
                return $http(settings).then(returnKeys).catch(errorHandler)
            }
        }

        sp.getUserStorage = function (listTitle) {
            return new UserStorage(listTitle);
        }
        /***** USER STORAGE END******/


        sp.sendEmail = function (toList, ccList, subject, mailContent) {
            return sp.getFormDigest().then(function (digest) {

                var sendEmailRestUrl = "/_api/SP.Utilities.Utility.SendEmail";
                if (_spPageContextInfo) {
                    sendEmailRestUrl = _spPageContextInfo.webAbsoluteUrl + sendEmailRestUrl;
                }

                var mailObject = {
                    'properties': {
                        '__metadata': {
                            'type': 'SP.Utilities.EmailProperties'
                        },
                        'To': {
                            'results': toList
                        },
                        //'From': 'user@contoso.onmicrosoft.com"',
                        //'FromDisplay': 'Display From"', // <--- I want a property like this one
                        // Important Note: this property does not work in SharePoint Online.
                        // the <from> field will always be "no-reply@sharepointonline.com"
                        'Subject': subject,
                        'Body': mailContent,
                        "AdditionalHeaders":
                        {
                            "__metadata":
                            { "type": "Collection(SP.KeyValue)" },
                            "results":
                            [
                                {
                                    "__metadata": {
                                        "type": 'SP.KeyValue'
                                    },
                                    "Key": "content-type",
                                    "Value": 'text/html',
                                    "ValueType": "Edm.String"
                                }
                            ]
                        }
                    }
                };

                if (ccList) {
                    mailObject.properties.__metadata.CC = {
                        'results': ccList
                    };
                }


                var data = JSON.stringify(mailObject);
                var settings = Request.post(sendEmailRestUrl).digest(digest).data(data).settings;
                return $http(settings);
            });
        }

        sp.log = function (data) {
            $log.info(data);
        }

        function errorHandlerFieldExists(response) {
            $log.info(response);
            if (response.status === 400) {
                return false;
            }
            else {
                return true;
            }
        }

        function returnTrueIfNotZero(result) {

            if (result.data.value) {
                return (result.data.value.length > 0);
            }
            if (result.data.d.results.length === 0) {
                return false;
            }
            else {
                return true;
            }
        }
        function returnTrueIfExists(response) {
            return response.data.d.results.length > 0;

        }
        function returnData(response) {
            $log.debug(response);
            return response.data;
        }

        function errorHandler(response) {
            $log.error(response);
            if (response.data.error.message.value) {
                $log.info(response.data.error.message.value);
            }
            else {
                $log.error(response);
            }

            return $q.reject(response);
        }

        return sp
    }

}())