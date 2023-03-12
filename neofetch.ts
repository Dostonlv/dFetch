
const packageList = await getInstalledPackages();
const osName = OsName()
const kernelVersion = await getKernelVersion();
const  hostname = HostName()
const shellName = GetShell()
const uptime = await getUptime();

getUsernameAndHostname()

console.log("----------------------------------------")

console.log('\x1b[31m%s\x1b[0m',`Current shell: ${shellName}`);
console.log('\x1b[36m%s\x1b[0m',`Hostname: ${hostname}`);
printCPUModelName().then();
console.log('\x1b[35m%s\x1b[0m',`Operating system: ${osName}`);
console.log('\x1b[32m%s\x1b[0m',`Packages: ${packageList.length} (brew)`);
console.log(`Kernel version: ${kernelVersion}`);
console.log('\x1b[33m%s\x1b[0m',`Uptime: ${uptime.days} days,  ${uptime.minutes} minutes`);
getDiskUsage()




async function getKernelVersion(): Promise<string> {
    const output = await Deno.run({
        cmd: ["uname", "-r"],
        stdout: "piped",
    }).output();

    return new TextDecoder().decode(output).trim();
}


async function Model(): Promise<string> {
    const output = await Deno.run({
        cmd: ["sysctl", "machdep.cpu.brand_string"],
        stdout: "piped",
    }).output();
    return new TextDecoder().decode(output).split(": ")[1].trim();
}
async function printCPUModelName() {
    const modelName = await Model();
    console.log('\x1b[34m%s\x1b[0m',`CPU model name: ${modelName}`);
}





function HostName(){
    return  Deno.hostname();
}


function OsName(){
    return Deno.build.os
}

async function getUptime(): Promise<{days: number, hours: number, minutes: number}> {
    const output = await Deno.run({
        cmd: ["uptime"],
        stdout: "piped",
    }).output();

    const uptimeText = new TextDecoder().decode(output).trim();

    const daysRegExp = /(\d+) day/;
    const match = uptimeText.match(daysRegExp);
    const days = match ? parseInt(match[1]) : 0;

    const hoursRegExp = /(\d+):(\d+)/;
    const [_, hours, minutes] = uptimeText.match(hoursRegExp);

    return { days, hours: parseInt(hours), minutes: parseInt(minutes) };
}


async function getInstalledPackages(): Promise<string[]> {
    const output = await Deno.run({
        cmd: ["brew", "list"],
        stdout: "piped",
    }).output();

    const text = new TextDecoder().decode(output);
    const packageList = text.split("\n");

    packageList.pop();

    return packageList;
}

function GetShell(){
    return Deno.env.get("SHELL")?.split("/").pop();
}



async function getDiskUsage(): Promise<string> {
    const process = Deno.run({
        cmd: ["df", "-h", "/"],
        stdout: "piped",
        stderr: "piped",
    });

    const [status, output, errOutput] = await Promise.all([
        process.status(),
        process.output(),
        process.stderrOutput(),
    ]);

    if (!status.success) {
        const errorString = new TextDecoder().decode(errOutput).trim();
        throw new Error(`Failed to get disk usage: ${errorString}`);
    }

    const outputString = new TextDecoder().decode(output).trim();

    const lines = outputString.split("\n");
    const tokens = lines[1].split(" ").filter((token) => token !== "");
    const usedSpace = tokens[2];
    const totalSpace = tokens[3];
    const percentageUsed = tokens[4];

     console.log('\x1b[32m%s\x1b[0m',`Disk (/): ${usedSpace} / ${totalSpace} (${percentageUsed})`);
}

function getUsernameAndHostname(): { username: string, hostname: string } {
    const username = Deno.env.get('USER');
    const hostname = Deno.hostname();
    console.log('\x1b[32m%s\x1b[0m',`${username}@${hostname}`)
}

