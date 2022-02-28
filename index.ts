import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";


// create a New VPC
const vpc = new awsx.ec2.Vpc("uniDeployVPC", {
    cidrBlock: "172.15.0.0/16",
    numberOfAvailabilityZones: 3,
    numberOfNatGateways: 1,
    subnets: [{ type: "public" }, { type: "private" }],
    tags: {
        Name: "uniDeployVPC",
        Env: pulumi.getStack()
    }
});


const _default = new aws.ec2.DefaultSecurityGroup("defaultVpcSg", {
    vpcId: vpc.id,
    ingress: [{
        protocol: "tcp",
        self: true,
        fromPort: 0,
        toPort: 0,
    },
    {
        protocol: "udp",
        self: true,
        fromPort: 0,
        toPort: 0,
    }],
    egress: [{
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: {
        Name: "defaultVpcSg",
        Env: pulumi.getStack()
    }
});



// exporting the newly created resource definition
export const vpcId = vpc.id;
export const vpcPrivateSubnetIds = vpc.privateSubnetIds;
export const vpcPublicSubnetIds = vpc.publicSubnetIds;
export const defaultSecGrpId = _default.id;

