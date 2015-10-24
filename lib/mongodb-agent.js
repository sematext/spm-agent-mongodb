/*
 * @copyright Copyright (c) Sematext Group, Inc. - All Rights Reserved
 *
 * @licence SPM Agent for MongoDB is free-to-use, proprietary software.
 * THIS IS PROPRIETARY SOURCE CODE OF Sematext Group, Inc. (Sematext)
 * This source code may not be copied, reverse engineered, or altered for any purpose.
 * This source code is to be used exclusively by users and customers of Sematext.
 * Please see the full license (found in LICENSE in this distribution) for details on its license and the licenses of its dependencies.
 */
var Agent = require('spm-agent').Agent
var logger = require('spm-agent').Logger
var config = require('spm-agent').Config
var Db = require('mongodb').Db
var Server = require('mongodb').Server
var flatten = require('flat')
var Aggregator = require('./aggregator')

var metricGroups = {
  oc: [
    'opcounters.insert',
    'opcounters.query',
    'opcounters.update',
    'opcounters.delete',
    'opcounters.getmore',
    'opcounters.command'
  ],
  cmd: [
    'spm_commands_summary.total',
    'spm_commands_summary.failed'
  ],
  ocr: [
    'opcountersRepl.insert',
    'opcountersRepl.query',
    'opcountersRepl.update',
    'opcountersRepl.delete',
    'opcountersRepl.getmore',
    'opcountersRepl.command'
  ],
  net: [
    'connections.current',
    'connections.totalCreated',
    'network.bytesIn',
    'network.bytesOut',
    'network.numRequests'
  ],
  doc: [
    'metrics.document.deleted',
    'metrics.document.inserted',
    'metrics.document.returned',
    'metrics.document.updated'
  ],
  dur: [
    'dur.commits',
    'dur.journaledMB',
    'dur.timeMs.dt',
    'dur.timeMs.commits',
    'dur.timeMs.commitsInWriteLock'
  ],
  log: [
    'spm_locks.Global.acquireCount',
    'spm_locks.Global.acquireWaitCount',
    'spm_locks.Global.timeAcquiringMicros',
    'spm_locks.Global.deadlockCount'
  ],
  loj: [
    'spm_locks.MMAPV1Journal.acquireCount',
    'spm_locks.MMAPV1Journal.acquireWaitCount',
    'spm_locks.MMAPV1Journal.timeAcquiringMicros',
    'spm_locks.MMAPV1Journal.deadlockCount'

  ],
  lodb: [
    'spm_locks.Database.acquireCount',
    'spm_locks.Database.acquireWaitCount',
    'spm_locks.Database.timeAcquiringMicros',
    'spm_locks.Database.deadlockCount'
  ],
  loco: [
    'spm_locks.Collection.acquireCount',
    'spm_locks.Collection.acquireWaitCount',
    'spm_locks.Collection.timeAcquiringMicros',
    'spm_locks.Collection.deadlockCount'
  ],
  lome: [
    'spm_locks.Metadata.acquireCount',
    'spm_locks.Metadata.acquireWaitCount',
    'spm_locks.Metadata.timeAcquiringMicros',
    'spm_locks.Metadata.deadlockCount'
  ],
  bgf: [
    'backgroundFlushing.flushes',
    'backgroundFlushing.total_ms',
    'backgroundFlushing.average_ms'
  ],
  mem: [
    'mem.resident',
    'mem.virtual',
    'mem.supported',
    'mem.mapped',
    'mem.mappedWithJournal'
  ]
}

var metricsDefinition = {
  'opcounters.insert': {calcDiff: true, agg: 'sum'},
  'opcounters.query': {calcDiff: true, agg: 'sum'},
  'opcounters.update': {calcDiff: true, agg: 'sum'},
  'opcounters.delete': {calcDiff: true, agg: 'sum'},
  'opcounters.getmore': {calcDiff: true, agg: 'sum'},
  'opcounters.command': {calcDiff: true, agg: 'sum'},
  'spm_commands_summary.total': {calcDiff: true, agg: 'sum'},
  'spm_commands_summary.failed': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.insert': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.query': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.update': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.delete': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.getmore': {calcDiff: true, agg: 'sum'},
  'opcountersRepl.command': {calcDiff: true, agg: 'sum'},
  'connections.current': {calcDiff: false, agg: 'mean'},
  'network.bytesIn': {calcDiff: true, agg: 'sum'},
  'connections.totalCreated': {calcDiff: false, agg: 'mean'},
  'network.bytesOut': {calcDiff: true, agg: 'sum'},
  'network.numRequests': {calcDiff: true, agg: 'sum'},
  'metrics.document.deleted': {calcDiff: true, agg: 'sum'},
  'metrics.document.inserted': {calcDiff: true, agg: 'sum'},
  'metrics.document.returned': {calcDiff: true, agg: 'sum'},
  'metrics.document.updated': {calcDiff: true, agg: 'sum'},
  'dur.commits': {calcDiff: false, agg: 'max'},
  'dur.journaledMB': {calcDiff: false, agg: 'max'},
  'dur.timeMs.dt': {calcDiff: false, agg: 'sum'},
  'dur.timeMs.commits': {calcDiff: false, agg: 'sum'},
  'dur.timeMs.commitsInWriteLock': {calcDiff: false, agg: 'sum'},
  'globalLock.totalTime': {calcDiff: true, agg: 'sum'},
  'globalLock.currentQueue.total': {calcDiff: true, agg: 'sum'},
  'globalLock.currentQueue.readers': {calcDiff: true, agg: 'max'},
  'globalLock.currentQueue.writers': {calcDiff: true, agg: 'max'},
  'globalLock.activeClients.total': {calcDiff: true, agg: 'max'},
  'globalLock.activeClients.readers': {calcDiff: true, agg: 'max'},
  'globalLock.activeClients.writers': {calcDiff: true, agg: 'max'},
  'backgroundFlushing.flushes': {calcDiff: true, agg: 'sum'},
  'backgroundFlushing.total_ms': {calcDiff: true, agg: 'sum'},
  'backgroundFlushing.average_ms': {calcDiff: false, agg: 'mean'},

  'mem.resident': {calcDiff: false, agg: 'mean'},
  'mem.virtual': {calcDiff: false, agg: 'mean'},
  'mem.supported': {calcDiff: false, agg: 'mean'},
  'mem.mapped': {calcDiff: false, agg: 'mean'},
  'mem.mappedWithJournal': {calcDiff: false, agg: 'mean'},

  // spm-agent aggregated metrics
  'spm_locks.Global.acquireCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Global.acquireWaitCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Global.timeAcquiringMicros': {calcDiff: true, agg: 'sum'},
  'spm_locks.Global.deadlockCount': {calcDiff: true, agg: 'sum'},

  'spm_locks.MMAPV1Journal.acquireCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.MMAPV1Journal.acquireWaitCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.MMAPV1Journal.timeAcquiringMicros': {calcDiff: true, agg: 'sum'},
  'spm_locks.MMAPV1Journal.deadlockCount': {calcDiff: true, agg: 'sum'},

  'spm_locks.Database.acquireCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Database.acquireWaitCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Database.timeAcquiringMicros': {calcDiff: true, agg: 'sum'},
  'spm_locks.Database.deadlockCount': {calcDiff: true, agg: 'sum'},

  'spm_locks.Collection.acquireCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Collection.acquireWaitCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Collection.timeAcquiringMicros': {calcDiff: true, agg: 'sum'},
  'spm_locks.Collection.deadlockCount': {calcDiff: true, agg: 'sum'},

  'spm_locks.Metadata.acquireCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Metadata.acquireWaitCount': {calcDiff: true, agg: 'sum'},
  'spm_locks.Metadata.timeAcquiringMicros': {calcDiff: true, agg: 'sum'},
  'spm_locks.Metadata.deadlockCount': {calcDiff: true, agg: 'sum'}
}

function MongoDbAgent (url) {
  var u = require('url')
  var mongoCfg = u.parse (url)
  mongoCfg.user = function () {
    if (this.auth) {
      return this.auth.split(':')[0]
    } else return ''
    
  }
  mongoCfg.password = function () {
    if (this.auth) {
      return this.auth.split(':')[1]
    } else return ''
  }
  mongoCfg.database = function () {
    return this.path.replace('/', '')
  }
  return new Agent(
    {
      timers: [],
      start: function (agent) {
        var self = this
        this.init()
        logger.info('start mongoDb agent')
        var now = new Date().getTime()
        var timerId = setInterval(function () {
          self.getMongoStats(function (metrics) {
            self.aggregate(metrics)
          })
        }, 1000)
        this.timers.push(timerId)
        timerId = setInterval(function () {
          var mGroups = self.getAggregatedValues()
          Object.keys(mGroups).forEach(function (group) {
            var mName = group
            var filters = [mongoCfg.host]
            if (/^lo.*/.test(group)) {
              mName = 'lo'
              filters.push([mGroups[group].keys[0].split('.')[1]])
            }
            var metrics = {ts: now, type: 'mo', filters: filters, name: mName, fieldInfo: mGroups[group].keys, value: mGroups[group].values, sct: 'APP'}
            console.log(metrics)
            agent.addMetrics(metrics)
          })
          self.agg.reset()
        }, config.collectionInterval || 10000)
        this.timers.push(timerId)
      },
      stop: function () {
        this.timers.forEach(function (tid) {
          clearInterval(tid)
        })
      },
      init: function () {
        var self = this
        this.agg = new Aggregator()
        this.db = new Db(mongoCfg.database(),
          new Server(mongoCfg.hostname,
            mongoCfg.port),
          {safe: false, retryMiliSeconds: 2000, numberOfRetries: 1000})
        this.adminDb = this.db.admin()
        config.logger.level = 'debug'
        config.logger.console = 'true'
        this.db.open(function (err, db) {
          if (err) {
            console.error(err.toString())
            return
          }
          self.adminDb.authenticate(
            mongoCfg.user(),
            mongoCfg.password(),
            function (err, result) {
              if (err) {
                console.error(err.toString())
                return
              }
            })
        })
      },
      getMongoStats: function (cbf) {
        // var adminDb = db.admin()
        var self = this
        this.adminDb.serverStatus(function (err, info) {
          if (err) {
            self.db.close()
            self.init()
            return
          }
          // console.log(info)
          if (!err && info && cbf) {
            var summary = {total: 0, failed: 0}
            // transform OpsCounter to a summary
            Object.keys(info.metrics.commands).forEach(function (prop) {
              if (info.metrics['commands'][prop]) {
                if (info.metrics.commands[prop].hasOwnProperty('failed')) {
                  summary.failed += info.metrics.commands[prop].failed
                  summary.total += info.metrics.commands[prop].total
                }
              }
            })
            info['spm_commands_summary'] = summary
            var locksSummary = {}
            var subsections = ['acquireCount', 'acquireWaitCount', 'timeAcquiringMicros', 'deadlockCount']
            var lockTypes = ['r', 'R', 'w', 'W']
            // console.log(info.locks)
            Object.keys(info.locks).forEach(function (section) {
              locksSummary[section] = {}
              subsections.forEach(function (subsection) {
                locksSummary[section][subsection] = {}
                lockTypes.forEach(function (lockType) {
                  locksSummary[section][subsection] = 0
                  if (info.locks[section][subsection] && info.locks[section][subsection][lockType]) {
                    locksSummary[section][subsection] += info.locks[section][subsection][lockType]
                  }
                })
              })
            })
            info.spm_locks = locksSummary
            cbf(flatten(info))
          }
        })
      },

      aggregate: function aggregate (stats) {
        var self = this
        Object.keys(metricGroups).forEach(function (group) {
          metricGroups[group].forEach(function (prop) {
            // console.log(prop)
            if (!isNaN(stats[prop])) {
              self.agg.update(new Date().getTime(), prop, stats[prop] * 1.0 || 0, metricsDefinition[prop].calcDiff)
            } else {
              console.error('property not defined' + prop + ' ' + stats[prop])
            }
          })
        })
      },

      getAggregatedValues: function () {
        var self = this
        var groups = {}
        Object.keys(metricGroups).forEach(function (group) {
          var values = []
          var keys = []
          metricGroups[group].forEach(function (prop) {
            // console.log(metricsDefinition[prop])
            var val = self.agg.get(prop)
            // console.log(val)
            val = val[metricsDefinition[prop].agg]
            console.log(prop + ': ' + val)
            values.push(val)
            keys.push(prop)
          })
          groups[group] = {keys: keys, values: values}
          console.log(keys.join('\t'))
          console.log(values.join('\t'))
        })
        return groups
      }

    }
  )
}

module.exports = MongoDbAgent
