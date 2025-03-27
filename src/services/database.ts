import * as SQLite from 'expo-sqlite';
import { HairSnapshot, UserSettings } from '../types';

// Open database
const db = SQLite.openDatabase('hairsnap.db');

// Initialize database tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create snapshots table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS snapshots (
          id TEXT PRIMARY KEY NOT NULL,
          imageUri TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          notes TEXT,
          hairLossScore REAL,
          crownScore REAL,
          hairlineScore REAL,
          overallScore REAL
        );`,
        [],
        () => {
          // Create settings table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS settings (
              id INTEGER PRIMARY KEY NOT NULL,
              reminderFrequency TEXT NOT NULL,
              morningTime TEXT,
              eveningTime TEXT,
              username TEXT,
              notificationsEnabled INTEGER NOT NULL
            );`,
            [],
            () => {
              // Check if settings exist, if not insert default settings
              tx.executeSql(
                'SELECT * FROM settings LIMIT 1;',
                [],
                (_, result) => {
                  if (result.rows.length === 0) {
                    tx.executeSql(
                      `INSERT INTO settings (
                        id, reminderFrequency, morningTime, eveningTime, 
                        username, notificationsEnabled
                      ) VALUES (?, ?, ?, ?, ?, ?);`,
                      [1, 'daily', '09:00', '21:00', null, 1],
                      () => resolve(),
                      error => reject(error)
                    );
                  } else {
                    resolve();
                  }
                },
                error => reject(error)
              );
            },
            error => reject(error)
          );
        },
        error => reject(error)
      );
    });
  });
};

// Snapshots CRUD operations
export const saveSnapshot = (snapshot: HairSnapshot): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO snapshots (
          id, imageUri, timestamp, notes, hairLossScore, 
          crownScore, hairlineScore, overallScore
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          snapshot.id,
          snapshot.imageUri,
          snapshot.timestamp,
          snapshot.notes || null,
          snapshot.hairLossScore || null,
          snapshot.areas?.crown || null,
          snapshot.areas?.hairline || null,
          snapshot.areas?.overall || null
        ],
        () => resolve(),
        error => reject(error)
      );
    });
  });
};

export const getSnapshotById = (id: string): Promise<HairSnapshot | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM snapshots WHERE id = ?;',
        [id],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              id: row.id,
              imageUri: row.imageUri,
              timestamp: row.timestamp,
              notes: row.notes,
              hairLossScore: row.hairLossScore,
              areas: {
                crown: row.crownScore,
                hairline: row.hairlineScore,
                overall: row.overallScore
              }
            });
          } else {
            resolve(null);
          }
        },
        error => reject(error)
      );
    });
  });
};

export const getAllSnapshots = (): Promise<HairSnapshot[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM snapshots ORDER BY timestamp DESC;',
        [],
        (_, result) => {
          const snapshots: HairSnapshot[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            snapshots.push({
              id: row.id,
              imageUri: row.imageUri,
              timestamp: row.timestamp,
              notes: row.notes,
              hairLossScore: row.hairLossScore,
              areas: {
                crown: row.crownScore,
                hairline: row.hairlineScore,
                overall: row.overallScore
              }
            });
          }
          resolve(snapshots);
        },
        error => reject(error)
      );
    });
  });
};

export const deleteSnapshot = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM snapshots WHERE id = ?;',
        [id],
        () => resolve(),
        error => reject(error)
      );
    });
  });
};

// Settings operations
export const getUserSettings = (): Promise<UserSettings> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM settings LIMIT 1;',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              reminderFrequency: row.reminderFrequency as 'daily' | 'twice-daily',
              reminderTimes: {
                morning: row.morningTime,
                evening: row.eveningTime
              },
              username: row.username,
              notificationsEnabled: Boolean(row.notificationsEnabled)
            });
          } else {
            // Default settings if none found (should not happen due to init)
            resolve({
              reminderFrequency: 'daily',
              reminderTimes: {
                morning: '09:00',
                evening: '21:00'
              },
              notificationsEnabled: true
            });
          }
        },
        error => reject(error)
      );
    });
  });
};

export const updateUserSettings = (settings: UserSettings): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE settings SET 
          reminderFrequency = ?, 
          morningTime = ?, 
          eveningTime = ?,
          username = ?,
          notificationsEnabled = ?
        WHERE id = 1;`,
        [
          settings.reminderFrequency,
          settings.reminderTimes.morning || null,
          settings.reminderTimes.evening || null,
          settings.username || null,
          settings.notificationsEnabled ? 1 : 0
        ],
        () => resolve(),
        error => reject(error)
      );
    });
  });
}; 