var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ExecController_1;
import { Controller, Query, Sse, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExecService } from '../services/exec.service.js';
let ExecController = ExecController_1 = class ExecController {
    constructor(execService) {
        this.execService = execService;
        this.logger = new Logger(ExecController_1.name);
    }
    exec(cmd) {
        this.logger.log(`SSE request: cmd=${cmd}`);
        const child = this.execService.spawnSse(cmd);
        const stdout = child.stdout;
        const stderr = child.stderr;
        stdout.setEncoding('utf8');
        stderr.setEncoding('utf8');
        return new Observable((subscriber) => {
            const onStdout = (chunk) => {
                subscriber.next({ data: chunk });
            };
            const onStderr = (chunk) => {
                subscriber.next({ data: chunk });
            };
            const onClose = (code) => {
                subscriber.next({ data: `\n[process exited with code ${code}]` });
                subscriber.complete();
            };
            const onError = (err) => {
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
                try {
                    child.kill();
                }
                catch { }
            };
        }).pipe(map((data) => data));
    }
};
__decorate([
    Sse(),
    __param(0, Query('cmd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Observable)
], ExecController.prototype, "exec", null);
ExecController = ExecController_1 = __decorate([
    Controller('api/exec'),
    __metadata("design:paramtypes", [ExecService])
], ExecController);
export { ExecController };
//# sourceMappingURL=exec.controller.js.map