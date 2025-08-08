var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExecService_1;
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import argvSplit from 'string-argv';
let ExecService = ExecService_1 = class ExecService {
    constructor() {
        this.logger = new Logger(ExecService_1.name);
    }
    validateCommand(commandLine) {
        if (!commandLine || !commandLine.trim()) {
            throw new BadRequestException('Command is required');
        }
        const tokens = argvSplit(commandLine);
        if (tokens.length === 0) {
            throw new BadRequestException('Empty command');
        }
        const cmd = tokens[0];
        const args = tokens.slice(1);
        return { cmd, args };
    }
    spawnSse(commandLine) {
        const { cmd, args } = this.validateCommand(commandLine);
        this.logger.log(`Executing: ${cmd} ${args.join(' ')}`);
        const startedAt = Date.now();
        const child = spawn(cmd, args, { shell: false });
        child.on('close', (code) => {
            const ms = Date.now() - startedAt;
            this.logger.log(`Finished: ${cmd} ${args.join(' ')} => exit ${code} in ${ms}ms`);
        });
        child.on('error', (err) => {
            this.logger.error(`Spawn error for: ${cmd} ${args.join(' ')}`, err);
        });
        return child;
    }
};
ExecService = ExecService_1 = __decorate([
    Injectable()
], ExecService);
export { ExecService };
//# sourceMappingURL=exec.service.js.map