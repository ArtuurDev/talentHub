import { Controller, Get } from "@nestjs/common";
import { ProxyService } from "./proxy/proxy.service";


@Controller()
export class AppController {
  constructor(
    private readonly proxyService: ProxyService,
  ) { }
}