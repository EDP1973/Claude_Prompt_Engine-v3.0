# Asterisk Installation Guide for ViciDial v12

## Prerequisites
- Ubuntu 20.04 LTS or CentOS 7/8
- Root or sudo access
- Internet connectivity

## Step 1: Install Dependencies

```bash
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    wget \
    curl \
    git \
    libncurses-dev \
    libsqlite3-dev \
    libpq-dev \
    libssl-dev \
    libxml2-dev \
    libjansson-dev \
    uuid-dev
```

## Step 2: Download Asterisk

```bash
cd /usr/src
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-18.16.0.tar.gz
sudo tar -xzf asterisk-18.16.0.tar.gz
cd asterisk-18.16.0
```

## Step 3: Install Asterisk

```bash
sudo ./configure --prefix=/opt/asterisk --libdir=/opt/asterisk/lib
sudo make
sudo make install
sudo make config
sudo make samples
```

## Step 4: Create Asterisk User

```bash
sudo useradd -r -s /bin/false asterisk
sudo chown -R asterisk:asterisk /opt/asterisk
sudo chown -R asterisk:asterisk /var/spool/asterisk
sudo chown -R asterisk:asterisk /var/log/asterisk
```

## Step 5: Configure ViciDial Dialplan

```bash
# Copy configuration
sudo cp asterisk-vicidial-v12-optimized.conf /etc/asterisk/extensions.conf

# Update credentials
sudo sed -i 's/VICIDIAL_ACCOUNT_ID/YOUR_INTELIMEX_ID/g' /etc/asterisk/extensions.conf
sudo sed -i 's/YOUR_INTELIMEX_PASSWORD/YOUR_PASSWORD/g' /etc/asterisk/extensions.conf

# Set permissions
sudo chown asterisk:asterisk /etc/asterisk/extensions.conf
sudo chmod 644 /etc/asterisk/extensions.conf
```

## Step 6: Start Asterisk

```bash
sudo systemctl start asterisk
sudo systemctl enable asterisk
```

## Step 7: Verify Installation

```bash
# Check Asterisk running
sudo systemctl status asterisk

# Connect to Asterisk CLI
sudo asterisk -r

# In Asterisk console:
dialplan show vicidial-outbound
sip show peers
sip show registry
```

## Troubleshooting

### Check Asterisk version
```bash
asterisk -v
```

### View logs
```bash
tail -f /var/log/asterisk/full
```

### Test SIP connectivity
```bash
ngrep -W byline -d any port 5060
```

### Reload configuration
```bash
asterisk -rx "dialplan reload"
asterisk -rx "sip reload"
```

## Testing the Configuration

Run the test script:
```bash
./test-asterisk-config.sh
```

