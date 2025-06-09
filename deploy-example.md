# Deployment Example

## Quick Deployment to S3

### 1. Configure AWS Credentials
```bash
aws configure --profile my-profile
```

### 2. Create S3 Bucket
```bash
# Replace your-bucket-name with your desired bucket name
aws s3 mb s3://your-bucket-name --profile my-profile
```

### 3. Set Bucket Policy
```bash
# Edit scripts/s3-bucket-policy.json, replace YOUR_BUCKET_NAME with your bucket name
# Then apply the policy
aws s3api put-bucket-policy \
    --bucket your-bucket-name \
    --policy file://scripts/s3-bucket-policy.json \
    --profile my-profile
```

### 4. Disable Block Public Access
```bash
aws s3api put-public-access-block \
    --bucket your-bucket-name \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --profile my-profile
```

### 5. Deploy Application
```bash
# Using Node.js script to deploy
node scripts/deploy-mobile.js your-bucket-name my-profile

# Or using npm script
npm run deploy:mobile your-bucket-name my-profile

# Or using bash script
./scripts/deploy-mobile.sh your-bucket-name my-profile
```

### 6. Access Your Application
After successful deployment, the website URL will be displayed in the command line output, in the format:
```
http://your-bucket-name.s3-website-region.amazonaws.com
```

## Complete Example Commands

Assuming your bucket name is `emotion-detox-mobile` and AWS profile is `default`:

```bash
# 1. Create bucket
aws s3 mb s3://emotion-detox-mobile

# 2. Set public access
aws s3api put-public-access-block \
    --bucket emotion-detox-mobile \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 3. Edit policy file (replace YOUR_BUCKET_NAME with emotion-detox-mobile)
# 4. Apply policy
aws s3api put-bucket-policy \
    --bucket emotion-detox-mobile \
    --policy file://scripts/s3-bucket-policy.json

# 5. Deploy
node scripts/deploy-mobile.js emotion-detox-mobile default
``` 