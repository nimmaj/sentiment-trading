fxdata <- function(year, month, day) {
  temp <- tempfile()
  download.file(paste("http://www.forexite.com/free_forex_quotes/", year, "/", sprintf("%02d", month), "/", sprintf("%02d", day), sprintf("%02d", month), substr(year, 3, 4), ".zip", sep = ""), temp)
  data <- read.csv(unz(temp, paste(sprintf("%02d", day), sprintf("%02d", month), substr(year, 3, 4), ".txt", sep = "")), header=TRUE)
  unlink(temp)
  
  data
}

fxhist <- function(data, startTime, endTime, ccy) {
  data <- data[data[1] == ccy & data[3] >= startTime & data[3] < endTime,]
  
  data <- data[c("X.TIME.", "X.CLOSE.")]
  
  colnames(data) <- c("t", "r")
  
  data$t <- as.integer(data$t / 10000) * 60 + as.integer(data$t / 100) %% 100
  
  data
}

fxplot <- function(data, ccy) {
  fx <- fxhist(data, 0, 240000, ccy)
  
  plot(fx, pch=16)
 
  rm <- rollmean(abs(c(0, tail(head(c(fx$r, 0) - c(0, fx$r), -1), -1))), 20)
  valid <- rm > mean(rm) + sd(rm)
  maxIdx <- match(max(rm), rm)
  preIdx <- maxIdx - match(FALSE, rev(head(valid, maxIdx)))
  postIdx <- maxIdx + match(FALSE, tail(valid, -maxIdx))
 
  lines(data.frame(fx$t, fx$r[preIdx]), col="red")
  lines(data.frame(fx$t, fx$r[postIdx]), col="green")
}

fxjumpreturn <- function(data, ccy) {
  fx <- fxhist(data, 0, 240000, ccy)
  
  rm <- rollmean(abs(c(0, tail(head(c(fx$r, 0) - c(0, fx$r), -1), -1))), 20)
  valid <- rm > mean(rm) + sd(rm)
  maxIdx <- match(max(rm), rm)
  preIdx <- maxIdx - match(FALSE, rev(head(valid, maxIdx)))
  postIdx <- maxIdx + match(FALSE, tail(valid, -maxIdx))
  
  (fx$r[postIdx] / fx$r[preIdx] - 1) * 100
}

fxdailyreturn <- function(data, ccy) {
  fx <- fxhist(data, 0, 240000, ccy)
  
  (tail(fx$r, 1) / head(fx$r, 1) - 1) * 100
}

nfp <- read.csv("NFP.csv")
nfp$Date <- as.Date(nfp$Date, "%m-%d-%Y")
nfp$Actual <- as.integer(gsub("K", "", nfp$Actual)) * 1000
nfp$Concensus <- as.integer(gsub("K", "", nfp$Concensus)) * 1000
nfp$Predictor <- nfp$Predictor * 1000

dre <- {}
jre <- {}
drg <- {}
jrg <- {}

for (d in nfp$Date) {
  data <- fxdata(as.integer(format(as.Date(d), "%Y")), as.integer(format(as.Date(d), "%m")), as.integer(format(as.Date(d), "%d")))
  
  dre <- c(dre, fxdailyreturn(data, "EURUSD"))
  jre <- c(jre, fxjumpreturn(data, "EURUSD"))
  drg <- c(drg, fxdailyreturn(data, "GBPUSD"))
  jrg <- c(jrg, fxjumpreturn(data, "GBPUSD"))
}

nfp <- data.frame(nfp, drg, jrg, dre, jre)

colnames(nfp) <- c("Date","Actual", "Concensus", "Predictor", "GBPUSD daily return", "GBPUSD jump return", "EURUSD daily return", "EURUSD jump return")

p <- qplot(nfp$Predictor, nfp$"GBPUSD jump return" + nfp$"EURUSD jump return", xlab="Prediction (Actual - Concensus)", ylab = "Return")
p + annotate("text", x = 150000, y = 1.2, label = paste("r = ", cor(nfp$"Predictor", nfp$"GBPUSD jump return" + nfp$"EURUSD jump return")))

p <- qplot(nfp$Predictor, nfp$"GBPUSD daily return" + nfp$"EURUSD daily return", xlab="Prediction (Actual - Concensus)", ylab = "Return")
p + annotate("text", x = 150000, y = 2.75, label = paste("r = ", cor(nfp$"Predictor", nfp$"GBPUSD daily return" + nfp$"EURUSD daily return")))
