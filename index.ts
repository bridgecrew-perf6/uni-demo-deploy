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


// create a new ECR repository
const repository = new aws.ecr.Repository("uni-demo-continer-repo");
const repositoryPolicy = new aws.ecr.RepositoryPolicy("basicRepoPolicy", {
    repository: repository.id,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Sid: "new policy",
            Effect: "Allow",
            Principal: "*",
            Action: [
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:GetRepositoryPolicy",
                "ecr:ListImages",
                "ecr:DeleteRepository",
                "ecr:BatchDeleteImage",
                "ecr:SetRepositoryPolicy",
                "ecr:DeleteRepositoryPolicy"
            ]
        }]
    })
});


const lifecyclePolicy = new aws.ecr.LifecyclePolicy("uni-repo-life-cycle-policy", {
    repository: repository.id,
    policy: JSON.stringify({
        rules: [{
            rulePriority: 1,
            description: "Expire images older than 14 days",
            selection: {
                tagStatus: "untagged",
                countType: "sinceImagePushed",
                countUnit: "days",
                countNumber: 14
            },
            action: { type: "expire" }
        }]
    })
});


// exporting the newly created resource definition
export const vpcId = vpc.id;
export const vpcPrivateSubnetIds = vpc.privateSubnetIds;
export const vpcPublicSubnetIds = vpc.publicSubnetIds;
export const ecrRepo = repository.repositoryUrl;

