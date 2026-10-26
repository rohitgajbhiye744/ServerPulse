package com.serverpulse.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "serverpulse.alert.thresholds")
public class AlertThresholdProperties {

    private Threshold cpu = new Threshold(70, 90);
    private Threshold memory = new Threshold(75, 90);
    private Threshold disk = new Threshold(80, 95);

    public Threshold getCpu() { return cpu; }
    public void setCpu(Threshold cpu) { this.cpu = cpu; }
    public Threshold getMemory() { return memory; }
    public void setMemory(Threshold memory) { this.memory = memory; }
    public Threshold getDisk() { return disk; }
    public void setDisk(Threshold disk) { this.disk = disk; }

    public static class Threshold {
        private double warning;
        private double critical;

        public Threshold() {
        }

        public Threshold(double warning, double critical) {
            this.warning = warning;
            this.critical = critical;
        }

        public double getWarning() { return warning; }
        public void setWarning(double warning) { this.warning = warning; }
        public double getCritical() { return critical; }
        public void setCritical(double critical) { this.critical = critical; }
    }
}
