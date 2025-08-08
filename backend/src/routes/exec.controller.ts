import { Controller, Query, Sse, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExecService } from '../services/exec.service.js';
import type { MessageEvent } from '@nestjs/common';
import { Readable } from 'node:stream';

@Controller('api/exec')
export class ExecController {
  private readonly logger = new Logger(ExecController.name);
  constructor(private readonly execService: ExecService) {}

  @Sse()
  exec(@Query('cmd') cmd: string): Observable<MessageEvent> {
    this.logger.log(`SSE request: cmd=${cmd}`);
    const child = this.execService.spawnSse(cmd);
    const stdout = child.stdout as Readable;
    const stderr = child.stderr as Readable;
    stdout.setEncoding('utf8');
    stderr.setEncoding('utf8');

    return new Observable<MessageEvent>((subscriber) => {
      const onStdout = (chunk: string) => {
        subscriber.next({ data: chunk });
      };
      const onStderr = (chunk: string) => {
        subscriber.next({ data: chunk });
      };
      const onClose = (code: number) => {
        subscriber.next({ data: `\n[process exited with code ${code}]` });
        subscriber.complete();
      };
      const onError = (err: unknown) => {
        subscriber.next({ data: `Process error: ${String(err)}` });
        subscriber.complete();
      };

      stdout.on('data', onStdout);
      stderr.on('data', onStderr);
      child.on('close', onClose);
      child.on('error', onError);

      return () => {
        stdout.off('data', onStdout);
        stderr.off('data', onStderr);
        child.off('close', onClose);
        child.off('error', onError);
        try { child.kill(); } catch {}
      };
    }).pipe(map((data) => data));
  }
}

