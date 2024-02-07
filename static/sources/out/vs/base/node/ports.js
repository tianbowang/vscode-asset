/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net"], function (require, exports, net) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findFreePortFaster = exports.BROWSER_RESTRICTED_PORTS = exports.findFreePort = void 0;
    /**
     * Given a start point and a max number of retries, will find a port that
     * is openable. Will return 0 in case no free port can be found.
     */
    function findFreePort(startPort, giveUpAfter, timeout, stride = 1) {
        let done = false;
        return new Promise(resolve => {
            const timeoutHandle = setTimeout(() => {
                if (!done) {
                    done = true;
                    return resolve(0);
                }
            }, timeout);
            doFindFreePort(startPort, giveUpAfter, stride, (port) => {
                if (!done) {
                    done = true;
                    clearTimeout(timeoutHandle);
                    return resolve(port);
                }
            });
        });
    }
    exports.findFreePort = findFreePort;
    function doFindFreePort(startPort, giveUpAfter, stride, clb) {
        if (giveUpAfter === 0) {
            return clb(0);
        }
        const client = new net.Socket();
        // If we can connect to the port it means the port is already taken so we continue searching
        client.once('connect', () => {
            dispose(client);
            return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
        });
        client.once('data', () => {
            // this listener is required since node.js 8.x
        });
        client.once('error', (err) => {
            dispose(client);
            // If we receive any non ECONNREFUSED error, it means the port is used but we cannot connect
            if (err.code !== 'ECONNREFUSED') {
                return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
            }
            // Otherwise it means the port is free to use!
            return clb(startPort);
        });
        client.connect(startPort, '127.0.0.1');
    }
    // Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/net/base/port_util.cc#56
    exports.BROWSER_RESTRICTED_PORTS = {
        1: true, // tcpmux
        7: true, // echo
        9: true, // discard
        11: true, // systat
        13: true, // daytime
        15: true, // netstat
        17: true, // qotd
        19: true, // chargen
        20: true, // ftp data
        21: true, // ftp access
        22: true, // ssh
        23: true, // telnet
        25: true, // smtp
        37: true, // time
        42: true, // name
        43: true, // nicname
        53: true, // domain
        69: true, // tftp
        77: true, // priv-rjs
        79: true, // finger
        87: true, // ttylink
        95: true, // supdup
        101: true, // hostriame
        102: true, // iso-tsap
        103: true, // gppitnp
        104: true, // acr-nema
        109: true, // pop2
        110: true, // pop3
        111: true, // sunrpc
        113: true, // auth
        115: true, // sftp
        117: true, // uucp-path
        119: true, // nntp
        123: true, // NTP
        135: true, // loc-srv /epmap
        137: true, // netbios
        139: true, // netbios
        143: true, // imap2
        161: true, // snmp
        179: true, // BGP
        389: true, // ldap
        427: true, // SLP (Also used by Apple Filing Protocol)
        465: true, // smtp+ssl
        512: true, // print / exec
        513: true, // login
        514: true, // shell
        515: true, // printer
        526: true, // tempo
        530: true, // courier
        531: true, // chat
        532: true, // netnews
        540: true, // uucp
        548: true, // AFP (Apple Filing Protocol)
        554: true, // rtsp
        556: true, // remotefs
        563: true, // nntp+ssl
        587: true, // smtp (rfc6409)
        601: true, // syslog-conn (rfc3195)
        636: true, // ldap+ssl
        989: true, // ftps-data
        990: true, // ftps
        993: true, // ldap+ssl
        995: true, // pop3+ssl
        1719: true, // h323gatestat
        1720: true, // h323hostcall
        1723: true, // pptp
        2049: true, // nfs
        3659: true, // apple-sasl / PasswordServer
        4045: true, // lockd
        5060: true, // sip
        5061: true, // sips
        6000: true, // X11
        6566: true, // sane-port
        6665: true, // Alternate IRC [Apple addition]
        6666: true, // Alternate IRC [Apple addition]
        6667: true, // Standard IRC [Apple addition]
        6668: true, // Alternate IRC [Apple addition]
        6669: true, // Alternate IRC [Apple addition]
        6697: true, // IRC + TLS
        10080: true // Amanda
    };
    /**
     * Uses listen instead of connect. Is faster, but if there is another listener on 0.0.0.0 then this will take 127.0.0.1 from that listener.
     */
    function findFreePortFaster(startPort, giveUpAfter, timeout, hostname = '127.0.0.1') {
        let resolved = false;
        let timeoutHandle = undefined;
        let countTried = 1;
        const server = net.createServer({ pauseOnConnect: true });
        function doResolve(port, resolve) {
            if (!resolved) {
                resolved = true;
                server.removeAllListeners();
                server.close();
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                resolve(port);
            }
        }
        return new Promise(resolve => {
            timeoutHandle = setTimeout(() => {
                doResolve(0, resolve);
            }, timeout);
            server.on('listening', () => {
                doResolve(startPort, resolve);
            });
            server.on('error', err => {
                if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES') && (countTried < giveUpAfter)) {
                    startPort++;
                    countTried++;
                    server.listen(startPort, hostname);
                }
                else {
                    doResolve(0, resolve);
                }
            });
            server.on('close', () => {
                doResolve(0, resolve);
            });
            server.listen(startPort, hostname);
        });
    }
    exports.findFreePortFaster = findFreePortFaster;
    function dispose(socket) {
        try {
            socket.removeAllListeners('connect');
            socket.removeAllListeners('error');
            socket.end();
            socket.destroy();
            socket.unref();
        }
        catch (error) {
            console.error(error); // otherwise this error would get lost in the callback chain
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9wb3J0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEc7OztPQUdHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLFNBQWlCLEVBQUUsV0FBbUIsRUFBRSxPQUFlLEVBQUUsTUFBTSxHQUFHLENBQUM7UUFDL0YsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBRWpCLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNYLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ1osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLENBQUM7WUFDRixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFWixjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNYLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ1osWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUM1QixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBbkJELG9DQW1CQztJQUVELFNBQVMsY0FBYyxDQUFDLFNBQWlCLEVBQUUsV0FBbUIsRUFBRSxNQUFjLEVBQUUsR0FBMkI7UUFDMUcsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFD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