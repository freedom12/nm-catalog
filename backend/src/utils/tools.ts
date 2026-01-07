import fs from 'fs';

export const readText = (fileName: string): string => {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf8');
  }
  return '';
};

export const writeText = (fileName: string, data: string | object) => {
  fs.writeFileSync(
    fileName,
    typeof data === 'object' ? JSON.stringify(data) : data,
    'utf8'
  );
};

export const info = (message: string) => {
  console.log('\x1b[32m%s\x1b[0m', message);
};

export const getDuration = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
};

export const isUuid = (str: string): boolean => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    str
  );
};

export const toError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === 'string') {
    return new Error(err);
  }
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(String(err));
  }
};
