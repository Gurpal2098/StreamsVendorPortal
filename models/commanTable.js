var db = require('../database');
const { Pool } = require("pg");
const format = require('pg-format');
const pgp = require('pg-promise');
const pool = new Pool();

module.exports =
{
    getList: (query) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, (err, response) => {
                    done();
                    console.log("getList query : ---->", pgp.as.format(query.text, query.values))
                    if (!err) {
                        resolve([err, response.rows]);
                    } else {
                        resolve([err.message, null]);
                    }
                });
            });
        });
    },

    getRow: (query) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, (err, response) => {
                    done();
                    console.log("getRow query : ---->", pgp.as.format(query.text, query.values))
                    if (!err) {
                        resolve([err, response.rows[0]]);
                    } else {
                        resolve([err.message, null]);
                    }
                });
            });
        });
    },

    insert: (query) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, (err, response) => {
                    done();
                    console.log("Insert query---> ", pgp.as.format(query.text, query.values))
                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows[0]]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    getInQuery: (query, ids) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, [ids], (err, response) => {
                    done();

                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    bulkInsertData: (query) => {
        console.log(query)

        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, (err, response) => {
                    done();
                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });

    },

    bulkInsertData1: (query, valuesArray) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                client.query(query, valuesArray, (err, response) => {
                    done();
                    if (!err) {
                        console.log(response); // Log the response data if needed
                        resolve([null, response.rows]);
                    } else {
                        console.log(err);
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    updateData: (query) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                if (err) {
                    resolve([err.message, null]);
                }
                client.query(query, (err, response) => {
                    done();
                    if (!err) {
                        resolve([err, response.rows[0]]);
                    } else {
                        resolve([err.message, null]);
                    }
                });
            });
        });
    },

    updateObject: (table, update, condition) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                if (err) {
                    console.log(err);
                    resolve([err.message, '']);
                }
                let keyLength = 0;
                const query = "Update " + table + " SET " + Object.keys(update).map(key => key + "=$" + ++keyLength).join(", ") + " WHERE " + Object.keys(condition).map(key => key + "=$" + ++keyLength).join(" AND ") + " returning *";
                const parameters = [...Object.values(update), ...Object.values(condition)];
                client.query(query, parameters, (err, response) => {
                    console.log("Update query---> ", pgp.as.format(query, parameters))
                    done();
                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows[0]]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    getBulkUpdateIds: (query, values) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                if (err) {
                    console.log(err);
                    resolve([err.message, '']);
                }
                client.query(query, values, (err, response) => {
                    done();
                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    bulkUpdate: (query, values, ids) => {
        return new Promise(resolve => {
            db.connection.connect((err, client, done) => {
                if (err) {
                    console.log(err);
                    resolve([err.message, '']);
                }
                client.query(query, values, [ids], (err, response) => {
                    done();
                    if (!err) {
                        console.log(err)
                        resolve([err, response.rows]);
                    } else {
                        console.log(err)
                        resolve([err.message, '']);
                    }
                });
            });
        });
    },

    // ankit sir model of beginTransaction

    beginTransaction: (queryTextOne, queryTextTwo, queryTextThree) => {
        return new Promise((resolve) => {
            db.connection.connect((err, client, done) => {
                const shouldAbort = err => {
                    if (err) {
                        console.error('Error in transaction', err.stack)
                        db.connection.query('ROLLBACK', err => {
                            if (err) {
                                console.error('Error rolling back client', err.stack)
                            }
                            // release the client back to the pool
                            done()
                        })
                    }
                    return !!err
                }
                client.query('BEGIN', err => {
                    if (shouldAbort(err)) return
                    client.query(queryTextOne, (err, res) => {
                        if (shouldAbort(err)) return
                        if (!!res.rows[0].id) {
                            queryTextTwo.values.push(res.rows[0].id);
                            client.query(queryTextTwo, (err, resAcc) => {
                                for (const innerArray of queryTextThree.values) {
                                    innerArray.push(res.rows[0].id);
                                }
                                const vendorContactInsert = format(queryTextThree.text, queryTextThree.values);
                                client.query(vendorContactInsert, (err, resAcc) => {
                                    if (shouldAbort(err)) return
                                    client.query('COMMIT', err => {
                                        if (err) {
                                            console.error('Error committing transaction', err.stack)
                                            resolve([err, null]);
                                        }
                                        done();
                                        resolve([err, res.rows[0]]);
                                    });
                                })
                            })
                        }
                    })
                })
            })
        })
    }

    // pranshu model of beginTransaction

    // beginTransaction: (queries) => {
    //     const vendorData = {};
    //     return new Promise((resolve) => {
    //         db.connection.connect((err, client, done) => {
    //             const shouldAbort = err => {
    //                 if (err) {
    //                     console.error('Error in transaction', err.stack)
    //                     db.connection.query('ROLLBACK', err => {
    //                         if (err) {
    //                             console.error('Error rolling back client', err.stack)
    //                         }
    //                         // release the client back to the pool
    //                         done()
    //                     })
    //                 }
    //                 return !!err
    //             }
    //             client.query('BEGIN', (beginErr) => {
    //                 if (shouldAbort(beginErr)) {
    //                     console.log('begin error')
    //                     return resolve([beginErr, null]);
    //                 }

    //                 const executeQueries = (index) => {
    //                     if (index === queries.length) {

    //                         client.query('COMMIT', (commitErr) => {
    //                             if (commitErr) {
    //                                 console.error('Error committing transaction', commitErr.stack);
    //                                 return resolve([commitErr, null]);
    //                             }
    //                             done();
    //                             return resolve([null, true]);
    //                         });
    //                     } else {
    //                         const query = queries[index];
    //                         if (index === 1) {
    //                             console.log('before query', query)
    //                             query.values.push(vendorData.id);
    //                             console.log('after query', query)
    //                         }
    //                         if (index === 2) {
    //                             console.log('before query', query)
    //                             for (const innerArray of query.values) {
    //                                 innerArray.push(vendorData.id);
    //                             }
    //                             console.log('after query', query)
    //                         }
    //                         client.query(query.text, query.values, (queryErr, res) => {
    //                             if (shouldAbort(queryErr)) {
    //                                 return resolve([queryErr, null]);
    //                             }
    //                             if (index === 0) {
    //                                 vendorData.id = res.rows[0].id;
    //                                 console.log(vendorData.id);
    //                             }
    //                             executeQueries(index + 1);
    //                         });
    //                     }
    //                 };
    //                 executeQueries(0);
    //             });
    //         })
    //     })
    // }
};


